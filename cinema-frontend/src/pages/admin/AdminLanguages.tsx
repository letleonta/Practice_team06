import { useEffect, useState, useMemo } from 'react';
import { LanguageService } from '../../services/language.service.ts';
import type { LanguageDto, CreateLanguageDto } from '../../types/language';
import {Globe, Trash2, Search, Plus} from 'lucide-react';
import { notify } from "../../utils/toast.ts";
import { CreateCard } from "../../components/CreateCard.tsx";
import { ConfirmModal } from "../../components/ui/ConfirmModal.tsx";

const AdminLanguages = () => {
    const [languages, setLanguages] = useState<LanguageDto[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(false);
    const [deleteModal, setDeleteModal] = useState({
        isOpen: false,
        id: null as number | null,
        name: ''
    });
    const [isDeleting, setIsDeleting] = useState(false);

    const loadData = async () => {
        try {
            const data = await LanguageService.getAll();
            setLanguages(data);
        } catch (err) {
            console.error("Помилка завантаження мов", err);
        }
    };

    useEffect(() => { loadData(); }, []);

    const handleCreateLanguage = async (data: CreateLanguageDto) => {
        setLoading(true);
        try {
            await LanguageService.create(data);
            notify.success('Мову успішно додано!');
            await loadData();
        } catch (err: any) {
            notify.error('Помилка: ' + (err.response?.data?.message || 'Не вдалося додати'));
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteClick = (id: number, name: string) => {
        setDeleteModal({ isOpen: true, id, name });
    };

    const handleConfirmDelete = async () => {
        if (!deleteModal.id) return;
        setIsDeleting(true);
        try {
            await LanguageService.delete(deleteModal.id);
            notify.success('Мову видалено');
            await loadData();
            setDeleteModal({ isOpen: false, id: null, name: '' });
        } catch (err) {
            notify.error('Помилка видалення');
        } finally {
            setIsDeleting(false);
        }
    };

    const filteredLanguages = useMemo(() =>
            languages.filter(l => l.name.toLowerCase().includes(searchTerm.toLowerCase()))
        , [languages, searchTerm]);

    return (
        <div className="flex flex-col lg:flex-row gap-8 items-start text-white animate-fade-in">
            <ConfirmModal
                isOpen={deleteModal.isOpen}
                title="Видалити мову?"
                description={
                    <>Ви впевнені, що хочете видалити мову <span className="text-white font-bold">"{deleteModal.name}"</span>?</>
                }
                isLoading={isDeleting}
                onConfirm={handleConfirmDelete}
                onClose={() => setDeleteModal({ ...deleteModal, isOpen: false })}
            />

            <CreateCard
                title="Нова мова"
                buttonText="Додати мову"
                icon={Plus}
                loading={loading}
                onSubmit={handleCreateLanguage}
                fields={[
                    {
                        name: 'name',
                        label: "Назва",
                        placeholder: "Напр. Українська",
                        icon: Plus
                    }
                ]}
            />

            <div className="w-full lg:w-2/3 bg-[#1a1d26] rounded-4xl border border-gray-800 shadow-2xl overflow-hidden flex flex-col min-h-125">
                <div className="p-8 border-b border-gray-800 bg-gray-900/30 flex justify-between items-center gap-4">
                    <h2 className="font-black flex items-center gap-3 text-xl uppercase tracking-tighter italic">
                        <Globe className="text-red-600" size={24} /> Мови
                    </h2>
                    <div className="relative w-64">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                        <input
                            type="text"
                            placeholder="Пошук..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-gray-900 border border-gray-700 rounded-xl py-2.5 pl-11 outline-none focus:border-red-500 text-sm transition-all"
                        />
                    </div>
                </div>

                <div className="p-6 space-y-3 overflow-y-auto flex-1">
                    {filteredLanguages.length > 0 ? (
                        filteredLanguages.map(l => (
                            <div key={l.id} className="flex justify-between items-center bg-gray-900/50 p-4 rounded-2xl border border-gray-800 group hover:bg-gray-900 transition-all">
                                <span className="font-bold uppercase tracking-wider text-sm">{l.name}</span>
                                <button
                                    onClick={() => handleDeleteClick(l.id, l.name)}
                                    className="p-2 text-gray-600 hover:text-red-500 transition-all opacity-0 group-hover:opacity-100"
                                >
                                    <Trash2 size={18}/>
                                </button>
                            </div>
                        ))
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-gray-600 py-20">
                            <Globe size={40} className="mb-3 opacity-10" />
                            <p className="text-xs font-black uppercase tracking-widest">Мов не знайдено</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminLanguages;