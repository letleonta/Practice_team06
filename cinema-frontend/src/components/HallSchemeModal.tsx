import { useEffect, useState, useCallback, useMemo } from 'react';
import { X, Armchair, Trash2, Plus, ArrowLeftToLine, ArrowRightToLine, MousePointerClick, AlertCircle } from 'lucide-react';
import { SeatService } from '../services/seat.service';
import { HallService } from '../services/hall.service';
import { axiosInstance } from '../api/axiosInstance';
import type { HallDto } from '../types/hall';
import { type SeatDto, SeatType } from '../types/seat';
import { ConfirmModal } from './ui/ConfirmModal';
import axios from 'axios';

interface Props {
    hall: HallDto;
    onClose: () => void;
    onSeatChange: () => void;
}

export const HallSchemeModal = ({ hall, onClose, onSeatChange }: Props) => {
    const [seats, setSeats] = useState<SeatDto[]>([]);
    const [errorModal, setErrorModal] = useState({ isOpen: false, message: '' });
    const [rowToDelete, setRowToDelete] = useState<number | null>(null);
    const SEAT_WIDTH_WITH_GAP = 46;

    const handleActionError = useCallback((err: unknown, defaultMsg: string) => {
        let message = defaultMsg;
        if (axios.isAxiosError(err)) {
            message = err.response?.data?.message || err.message || message;
        } else if (err instanceof Error) {
            message = err.message;
        }
        setErrorModal({ isOpen: true, message });
    }, []);

    const loadSeats = useCallback(async () => {
        try {
            const data = await SeatService.getByHallId(hall.id);
            setSeats(data);
        } catch (err) {
            handleActionError(err, "Помилка завантаження схеми");
        }
    }, [hall.id, handleActionError]);

    useEffect(() => {
        void loadSeats();
    }, [loadSeats]);

    const isVipSeat = (seat: SeatDto): boolean => {
        const type = seat.seatType as unknown;
        return type === SeatType.VIP || type === 1 || type === "VIP";
    };

    const toggleSeatType = async (seat: SeatDto) => {
        const currentlyVip = isVipSeat(seat);
        const nextType = currentlyVip ? SeatType.Standard : SeatType.VIP;
        const nextModifier = currentlyVip ? 1.0 : 1.5;

        setSeats(prev => prev.map(s => s.id === seat.id ? {
            ...s,
            seatType: nextType as SeatType
        } : s));

        try {
            await SeatService.update(seat.id, {
                seatType: nextType,
                priceModifier: nextModifier
            });
            onSeatChange();
        } catch (err) {
            void loadSeats();
            handleActionError(err, "Не вдалося змінити категорію");
        }
    };

    const shiftRow = async (rowNumber: number, delta: number) => {
        try {
            await axiosInstance.post(`/halls/${hall.id}/rows/${rowNumber}/shift/${delta}`);
            await loadSeats();
        } catch (err) {
            handleActionError(err, "Неможливо зсунути ряд (межа або зайняті місця)");
        }
    };

    const handleDeleteSeat = async (id: number) => {
        try {
            await SeatService.delete(id);
            await loadSeats();
            onSeatChange();
        } catch (err) {
            handleActionError(err, "Не вдалося видалити місце (можливо, є квитки)");
        }
    };

    const handleAddSeatToRow = async (rowNumber: number) => {
        try {
            await HallService.addSeatToRow(hall.id, rowNumber);
            await loadSeats();
            onSeatChange();
        } catch (err) {
            handleActionError(err, "Помилка додавання місця");
        }
    };

    const handleAddNewRow = async () => {
        const currentRows = seats.map(s => s.rowNumber);
        const nextRowNumber = currentRows.length > 0 ? Math.max(...currentRows) + 1 : 1;

        try {
            const config = { rowNumber: nextRowNumber, seatCount: 10, type: 0 };
            await HallService.addRow(hall.id, config as unknown as any);
            await loadSeats();
            onSeatChange();
        } catch (err) {
            handleActionError(err, "Помилка створення ряду");
        }
    };

    const askDeleteRow = (rowNumber: number) => {
        setRowToDelete(rowNumber);
    };

    const confirmDeleteRow = async () => {
        if (rowToDelete === null) return;

        try {
            await HallService.deleteRow(hall.id, rowToDelete);
            await loadSeats();
            setRowToDelete(null);
        } catch (err) {
            setRowToDelete(null);
            setTimeout(() => handleActionError(err, "Не вдалося видалити ряд"), 100);
        }
    };

    const groupedRows = useMemo(() => {
        const map = new Map<number, SeatDto[]>();
        seats.forEach(s => {
            const r = map.get(s.rowNumber) || [];
            r.push(s);
            map.set(s.rowNumber, r);
        });
        return Array.from(map.entries()).sort((a, b) => a[0] - b[0]);
    }, [seats]);

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-fade-in">
            <div className="bg-[#161821] w-full max-w-5xl rounded-[40px] border border-white/5 shadow-2xl flex flex-col overflow-hidden max-h-[90vh]">

                {/* Header */}
                <div className="px-10 py-6 border-b border-white/5 flex justify-between items-center bg-white/[0.01]">
                    <div className="flex items-center gap-5">
                        <div className="p-3 bg-red-600 rounded-2xl shadow-lg shadow-red-600/20">
                            <Armchair className="text-white" size={24}/>
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-white uppercase tracking-tight leading-none">{hall.name}</h3>
                            <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mt-1 block">Конфігурація схеми залу</span>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2.5 bg-zinc-800/50 hover:bg-rose-600 text-white rounded-full transition-all duration-300">
                        <X size={20}/>
                    </button>
                </div>

                {/* Grid */}
                <div className="flex-1 overflow-auto custom-scrollbar p-10 bg-[#0f1118]">
                    <div className="flex flex-col items-center min-w-fit px-12">
                        <div className="w-full max-w-md mb-16 flex flex-col items-center opacity-70">
                            <div className="w-full h-1.5 bg-sky-500/30 rounded-full shadow-[0_0_20px_rgba(14,165,233,0.3)]"></div>
                            <span className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.8em] mt-3">Екран залу</span>
                        </div>

                        <div className="flex flex-col gap-4">
                            {groupedRows.map(([r, rowSeats]) => (
                                <div key={r} className="flex items-center gap-5 group/row">
                                    <div className="flex items-center gap-3 pr-5 border-r border-white/5">
                                        {/* КНОПКА ВИДАЛЕННЯ РЯДУ - викликає askDeleteRow */}
                                        <button
                                            onClick={() => askDeleteRow(r)}
                                            className="p-1.5 text-zinc-700 hover:text-rose-500 transition-all opacity-0 group-hover/row:opacity-100"
                                        >
                                            <Trash2 size={16}/>
                                        </button>
                                        <span className="text-[11px] font-black text-zinc-600 font-mono w-12 text-right uppercase">Ряд {r}</span>
                                    </div>

                                    <div className="flex flex-col gap-1.5">
                                        <button onClick={() => { void shiftRow(r, -1); }} className="p-1 text-zinc-700 hover:text-sky-500 transition-colors"><ArrowLeftToLine size={13}/></button>
                                        <button onClick={() => { void shiftRow(r, 1); }} className="p-1 text-zinc-700 hover:text-sky-500 transition-colors"><ArrowRightToLine size={13}/></button>
                                    </div>

                                    <div className="relative flex min-h-[48px]">
                                        <div className="flex gap-2 p-1.5 bg-black/20 rounded-[20px] border border-white/5">
                                            {rowSeats.sort((a,b) => a.seatNumber - b.seatNumber).map((s, idx) => {
                                                const isVip = isVipSeat(s);
                                                const prevSeat = rowSeats[idx-1];

                                                let marginLeft = 0;
                                                if (idx === 0) {
                                                    marginLeft = (s.seatNumber - 1) * SEAT_WIDTH_WITH_GAP;
                                                } else {
                                                    const gapSize = prevSeat ? (s.seatNumber - prevSeat.seatNumber - 1) : 0;
                                                    marginLeft = gapSize * SEAT_WIDTH_WITH_GAP;
                                                }

                                                return (
                                                    <div key={s.id} className="relative group/seat" style={{ marginLeft: marginLeft > 0 ? `${marginLeft}px` : '0' }}>
                                                        <button
                                                            onClick={() => { void toggleSeatType(s); }}
                                                            className={`w-10 h-11 rounded-t-2xl rounded-b-lg flex items-center justify-center text-[10px] font-black text-white shadow-xl transition-all duration-300 hover:scale-115 active:scale-90
                                                            ${isVip ? 'bg-amber-500 border-b-4 border-amber-700 shadow-amber-900/20' : 'bg-zinc-700 border-b-4 border-zinc-900 shadow-black/30'}`}
                                                        >
                                                            {idx + 1}
                                                        </button>
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); void handleDeleteSeat(s.id); }}
                                                            className="absolute -top-2 -right-2 bg-rose-600 text-white p-1 rounded-full opacity-0 group-hover/seat:opacity-100 hover:scale-110 transition-all shadow-xl z-10"
                                                        >
                                                            <X size={10} strokeWidth={4}/>
                                                        </button>
                                                    </div>
                                                );
                                            })}
                                            <button
                                                onClick={() => { void handleAddSeatToRow(r); }}
                                                className="w-10 h-11 rounded-xl border-2 border-dashed border-zinc-800 text-zinc-700 hover:border-emerald-500 hover:text-emerald-500 flex items-center justify-center transition-all ml-2 active:scale-90"
                                            >
                                                <Plus size={18}/>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}

                            <button
                                onClick={() => { void handleAddNewRow(); }}
                                className="mt-10 mx-auto px-10 py-5 bg-zinc-900 border border-white/5 rounded-[24px] text-[11px] font-black uppercase tracking-[0.2em] text-zinc-500 hover:text-white hover:bg-zinc-800 transition-all flex items-center gap-3 shadow-2xl active:scale-95"
                            >
                                <Plus size={20} className="text-rose-600"/> Додати новий ряд
                            </button>
                        </div>
                    </div>
                </div>

                <div className="px-10 py-5 bg-black/40 border-t border-white/5 flex justify-between items-center text-zinc-500">
                    <div className="flex gap-8">
                        <div className="flex items-center gap-2.5">
                            <div className="w-3.5 h-3.5 bg-zinc-700 rounded-sm"></div>
                            <span className="text-[10px] font-black uppercase tracking-widest">Standard</span>
                        </div>
                        <div className="flex items-center gap-2.5">
                            <div className="w-3.5 h-3.5 bg-amber-500 rounded-sm shadow-[0_0_10px_rgba(245,158,11,0.2)]"></div>
                            <span className="text-[10px] font-black uppercase tracking-widest">VIP</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 text-[9px] font-bold uppercase tracking-widest">
                        <MousePointerClick size={14} className="text-sky-500" />
                        <span>Клік для зміни типу місця</span>
                    </div>
                </div>
            </div>

            <ConfirmModal
                isOpen={errorModal.isOpen}
                title="УВАГА"
                description={
                    <div className="flex flex-col items-center gap-4 py-2">
                        <AlertCircle className="text-rose-500" size={32}/>
                        <p className="text-center text-zinc-300 text-sm leading-relaxed font-bold">{errorModal.message}</p>
                    </div>
                }
                confirmText="ЗРОЗУМІЛО"
                onConfirm={() => setErrorModal(prev => ({ ...prev, isOpen: false }))}
                onClose={() => setErrorModal(prev => ({ ...prev, isOpen: false }))}
            />

            <ConfirmModal
                isOpen={rowToDelete !== null}
                title="ВИДАЛЕННЯ РЯДУ"
                description={
                    <div className="text-center py-2">
                        <p className="text-zinc-300 text-sm font-bold">
                            Ви впевнені, що хочете видалити <span className="text-rose-500">РЯД {rowToDelete}</span>?
                        </p>
                        <p className="text-zinc-500 text-xs mt-2">Всі місця в цьому ряду будуть видалені.</p>
                    </div>
                }
                confirmText="ВИДАЛИТИ"
                onConfirm={() => void confirmDeleteRow()}
                onClose={() => setRowToDelete(null)}
            />
        </div>
    );
};