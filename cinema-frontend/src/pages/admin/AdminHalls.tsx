import { useState, useEffect, useMemo } from 'react';
import { UsePagination } from '../../hooks/UsePagination';
import { HallService } from '../../services/hall.service';
import { SeatService } from '../../services/seat.service';
import { DataTable, type Column } from '../../components/ui/DataTable.tsx';
import { Pagination } from '../../components/ui/Pagination.tsx';
import { PaginationInfo } from "../../components/ui/PaginationInfo.tsx";
import { CreateCard } from '../../components/ui/CreateCard.tsx';
import { HallSchemeModal } from '../../components/HallSchemeModal';
import type { HallDto } from '../../types/hall';
import { Trash2, Search, Plus, FileText, DollarSign, Pencil, AlertCircle } from 'lucide-react';
import { ConfirmModal } from "../../components/ui/ConfirmModal.tsx";
import axios from 'axios';

const AdminHalls = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedHall, setSelectedHall] = useState<HallDto | null>(null);
    const [seatCounts, setSeatCounts] = useState<Record<number, number>>({});
    const [isSchemeOpen, setIsSchemeOpen] = useState(false);
    const [createLoading, setCreateLoading] = useState(false);

    // Стейт для видалення
    const [hallToDelete, setHallToDelete] = useState<{ id: number; name: string } | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // НОВИЙ СТЕЙТ: Модалка помилки
    const [errorModal, setErrorModal] = useState<{ isOpen: boolean; message: string }>({
        isOpen: false,
        message: ''
    });

    const {
        items: halls, totalCount, currentPage, totalPages, pageSize, loading, error, goToPage, refresh,
    } = UsePagination(
        (page, size) => HallService.getAll(page, size, searchTerm),
        [searchTerm], { pageSize: 6 }
    );

    const fetchCounts = async () => {
        const counts: Record<number, number> = {};
        await Promise.all(halls.map(async (h) => {
            try {
                const seats = await SeatService.getByHallId(h.id);
                counts[h.id] = seats.length;
            } catch { counts[h.id] = 0; }
        }));
        setSeatCounts(prev => ({ ...prev, ...counts }));
    };

    useEffect(() => { if (halls.length > 0) fetchCounts(); }, [halls]);

    const hallFields = [
        { name: 'name', label: 'Назва залу', placeholder: 'Напр. Зал 1 (IMAX)', icon: Plus },
        { name: 'description', label: 'Опис', placeholder: 'Технічні характеристики...', icon: FileText, required: false },
        { name: 'priceModifier', label: 'Коефіцієнт ціни', type: 'number', placeholder: '1.0', icon: DollarSign }
    ];

    const handleCreateHall = async (data: any) => {
        setCreateLoading(true);
        try {
            await HallService.create({ ...data, priceModifier: Number(data.priceModifier) });
            refresh();
        } catch (err: any) {
            console.error(err);
        } finally {
            setCreateLoading(false);
        }
    };

    const handleConfirmDelete = async () => {
        if (!hallToDelete) return;
        setIsDeleting(true);

        try {
            await HallService.delete(hallToDelete.id);
            setHallToDelete(null);
            refresh();
        } catch (err: unknown) {
            setHallToDelete(null);

            let message = "Не вдалося видалити зал.";

            if (axios.isAxiosError(err)) {
                message = err.response?.data?.message || message;
            }

            setErrorModal({ isOpen: true, message });
        } finally {
            setIsDeleting(false);
        }
    };

    const columns: Column<HallDto>[] = useMemo(() => [
        {
            key: 'id',
            header: 'ID',
            width: 'w-24',
            render: (h) => <span className="text-red-600 font-black text-lg tracking-tighter">#{h.id}</span>
        },
        {
            key: 'name',
            header: "Зал",
            render: (h) => <span className="font-bold text-gray-100 uppercase">{h.name}</span>
        },
        {
            key: 'seats',
            header: "Місць",
            align: 'center',
            render: (h) => (
                <span className={`px-4 py-1.5 rounded-full text-[11px] font-black border transition-colors ${
                    (seatCounts[h.id] || 0) > 0
                        ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                        : 'bg-zinc-800 text-zinc-500 border-zinc-700/50'
                }`}>
                    {seatCounts[h.id] !== undefined ? seatCounts[h.id] : '...'}
                </span>
            )
        },
        {
            key: 'modifier',
            header: "Коефіцієнт",
            align: 'center',
            render: (h) => <span className="font-bold text-indigo-400 font-mono">×{h.priceModifier.toFixed(1)}</span>
        },
        {
            key: 'actions',
            header: 'Дії',
            width: 'w-20',
            align: 'right',
            render: (h) => (
                <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                        onClick={(e) => { e.stopPropagation(); setSelectedHall(h); setIsSchemeOpen(true); }}
                        className="p-2 text-gray-500 hover:text-white hover:bg-gray-800 rounded-xl transition-all"
                    >
                        <Pencil size={16} />
                    </button>
                    <button
                        onClick={(e) => { e.stopPropagation(); setHallToDelete({ id: h.id, name: h.name }); }}
                        className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all"
                    >
                        <Trash2 size={16} />
                    </button>
                </div>
            )
        }
    ], [seatCounts]);

    return (
        <div className="flex flex-col lg:flex-row gap-8 items-start text-white pb-10 animate-fade-in">

            <ConfirmModal
                isOpen={!!hallToDelete}
                title="Видалити кінозал?"
                description={
                    <div className="text-center text-zinc-400">
                        Ви впевнені, що хочете видалити зал <span className="text-white font-bold">"{hallToDelete?.name}"</span>?
                        <br />Усі дані (місця, налаштування) будуть втрачені.
                    </div>
                }
                onConfirm={handleConfirmDelete}
                onClose={() => setHallToDelete(null)}
                isLoading={isDeleting}
                confirmText="Видалити"
            />

            <ConfirmModal
                isOpen={errorModal.isOpen}
                title="УВАГА"
                description={
                    <div className="flex flex-col items-center gap-4 py-2">
                        <AlertCircle className="text-rose-500" size={40} />
                        <p className="text-center text-white text-md font-bold leading-relaxed">
                            {errorModal.message}
                        </p>
                    </div>
                }
                confirmText="ЗРОЗУМІЛО"
                onConfirm={() => setErrorModal(prev => ({ ...prev, isOpen: false }))}
                onClose={() => setErrorModal(prev => ({ ...prev, isOpen: false }))}
            />

            <CreateCard
                title="Новий зал"
                buttonText="Зберегти"
                icon={Plus}
                fields={hallFields}
                loading={createLoading}
                onSubmit={handleCreateHall}
            />

            <div className="w-full lg:w-2/3 flex flex-col gap-6">
                <div className="relative">
                    <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input
                        type="text"
                        placeholder="Пошук за назвою..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-10 py-3.5 rounded-2xl bg-[#1a1d26] border border-gray-800 text-sm focus:border-red-600 outline-none transition-all shadow-xl text-white font-sans"
                    />
                </div>

                <DataTable
                    data={halls}
                    columns={columns}
                    loading={loading}
                    error={error}
                    onRowClick={(h) => { setSelectedHall(h); setIsSchemeOpen(true); }}
                    className="shadow-2xl"
                />

                {!loading && totalPages > 0 && (
                    <div className="bg-[#161820] p-4 rounded-3xl border border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <PaginationInfo
                            currentPage={currentPage}
                            pageSize={pageSize}
                            totalCount={totalCount}
                            itemName="залів"
                        />
                        <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={goToPage}
                        />
                    </div>
                )}
            </div>

            {isSchemeOpen && selectedHall && (
                <HallSchemeModal
                    hall={selectedHall}
                    onClose={() => setIsSchemeOpen(false)}
                    onSeatChange={fetchCounts}
                />
            )}
        </div>
    );
};

export default AdminHalls;