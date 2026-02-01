import { useEffect, useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { hallService } from '../../services/hallService';
import { seatService } from '../../services/seatService';
import type { CreateHallDto, HallDto, RowConfigDto } from '../../types/hall';
import type { SeatDto } from '../../types/seat';
import { Layers, Search, Plus, LayoutGrid, Eye, X, Armchair, ListPlus, Send, Trash2, Loader2 } from 'lucide-react';

const AdminHalls = () => {
    const { register: registerHall, handleSubmit: handleSubmitHall, reset: resetHall } = useForm<CreateHallDto>({
        defaultValues: { priceModifier: 1.0 }
    });
    // --- СТАН ---
    const [halls, setHalls] = useState<HallDto[]>([]);
    const [seatCounts, setSeatCounts] = useState<Record<number, number>>({});
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(false);
    const [isSeatGenerationMode, setIsSeatGenerationMode] = useState(false);
    const [selectedHallSeats, setSelectedHallSeats] = useState<{ hallName: string, seats: SeatDto[] } | null>(null);

    const [selectedHallForSeats, setSelectedHallForSeats] = useState<number | "">("");
    const [flexibleRows, setFlexibleRows] = useState<RowConfigDto[]>([]);
    const [rowDraft, setRowDraft] = useState<RowConfigDto>({ rowNumber: 1, seatCount: 10, type: 0 });

    // --- ЗАВАНТАЖЕННЯ ДАНИХ ---
    const loadData = async () => {
        try {
            const hallsData = await hallService.getAll();
            setHalls(hallsData);
            const counts: Record<number, number> = {};
            const results = await Promise.allSettled(hallsData.map(h => seatService.getByHallId(h.id)));
            results.forEach((res, i) => {
                counts[hallsData[i].id] = res.status === 'fulfilled' ? res.value.length : 0;
            });
            setSeatCounts(counts);
        } catch (err) { console.error("Error loading halls:", err); }
    };

    useEffect(() => {
        loadData();
    }, []);

    // --- ФІЛЬТРАЦІЯ (Виправлено) ---
    const filteredHalls = useMemo(() => {
        return halls.filter((h: HallDto) =>
            h.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [halls, searchTerm]);

    // --- КЕРУВАННЯ МІСЦЯМИ ---
    const toggleSeatType = async (seat: SeatDto) => {
        const newType = Number(seat.seatType) === 1 ? 0 : 1;

        try {
            await seatService.updateSeat(seat.id, {
                seatType: newType,
                priceModifier: newType === 1 ? 1.5 : 1.0
            });

            if (selectedHallSeats) {
                const updatedSeats = selectedHallSeats.seats.map(s =>
                    s.id === seat.id ? { ...s, seatType: newType } : s
                );
                setSelectedHallSeats({ ...selectedHallSeats, seats: updatedSeats });
            }
        } catch (err) {
            console.error("Помилка оновлення місця:", err);
            alert("Не вдалося зберегти зміни в базі даних");
        }
    };

    const updateRowType = async (rowNum: number, newType: number) => {
        if (!selectedHallSeats) return;
        if (!window.confirm(`Змінити весь ряд ${rowNum} на ${newType === 1 ? 'VIP' : 'Standard'}?`)) return;

        const rowSeats = selectedHallSeats.seats.filter(s => s.rowNumber === rowNum);
        try {
            await Promise.all(rowSeats.map(s =>
                seatService.updateSeat(s.id, { seatType: newType, priceModifier: newType === 1 ? 2.0 : 1.0 })
            ));
            const updatedSeats = selectedHallSeats.seats.map(s =>
                s.rowNumber === rowNum ? { ...s, seatType: newType } : s
            );
            setSelectedHallSeats({ ...selectedHallSeats, seats: updatedSeats });
        } catch (err) { console.error(err); alert("Помилка оновлення ряду"); }
    };

    // --- ВИДАЛЕННЯ ТА СТВОРЕННЯ ---
    const handleDeleteHall = async (id: number) => {
        if (!window.confirm('Видалити цей зал?')) return;
        try {
            await hallService.delete(id);
            alert("Зал видалено");
            await loadData();
        } catch (err) { console.error(err); alert("Помилка видалення"); }
    };

    const onSubmitHall = async (data: CreateHallDto) => {
        setLoading(true);
        try {
            const result = await hallService.create({ ...data, priceModifier: Number(data.priceModifier) });
            alert(`Зал "${result.name}" створено!`);
            resetHall();
            await loadData();
            setSelectedHallForSeats(result.id);
            setIsSeatGenerationMode(true);
        } catch (err) { console.error(err); alert('Помилка створення'); }
        finally { setLoading(false); }
    };

    const addRowToDraft = () => {
        if (flexibleRows.some(r => r.rowNumber === rowDraft.rowNumber)) return alert("Ряд вже існує");
        setFlexibleRows([...flexibleRows, rowDraft].sort((a, b) => a.rowNumber - b.rowNumber));
        setRowDraft({ ...rowDraft, rowNumber: rowDraft.rowNumber + 1 });
    };

    const submitSeatsGeneration = async () => {
        if (!selectedHallForSeats || flexibleRows.length === 0) return alert("Заповніть дані!");
        try {
            await hallService.generateFlexibleSeats({ hallId: Number(selectedHallForSeats), rows: flexibleRows });
            alert("Місця згенеровано!");
            setFlexibleRows([]);
            setIsSeatGenerationMode(false);
            await loadData();
        } catch (err) { console.error(err); alert("Помилка генерації"); }
    };

    const openScheme = async (hall: HallDto) => {
        try {
            const seats = await seatService.getByHallId(hall.id);
            if (seats.length === 0) return alert("В залі немає місць");
            setSelectedHallSeats({ hallName: hall.name, seats });
        } catch { alert("Помилка завантаження"); }
    };

    const renderGrid = (seats: SeatDto[]) => {
        const rows = Array.from(new Set(seats.map(s => s.rowNumber))).sort((a, b) => a - b);
        return (
            <div className="flex flex-col items-center justify-center w-full">
                {/* ЕКРАН */}
                <div className="w-full max-w-sm mb-12 flex flex-col items-center">
                    <div className="w-full h-1.5 bg-gradient-to-r from-transparent via-blue-500 to-transparent rounded-full shadow-[0_0_15px_rgba(59,130,246,0.6)]"></div>
                    <span className="text-[10px] text-gray-500 uppercase tracking-[0.4em] mt-2 font-black">Екран</span>
                </div>
                {/* КРІСЛА */}
                <div className="flex flex-col gap-4">
                    {rows.map(r => (
                        <div key={r} className="flex gap-2 items-center justify-center group">
                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all mr-4">
                                <button onClick={() => updateRowType(r, 0)} className="px-2 py-1 bg-blue-900/40 text-[8px] rounded border border-blue-500/30 uppercase font-black">Std</button>
                                <button onClick={() => updateRowType(r, 1)} className="px-2 py-1 bg-amber-900/40 text-[8px] rounded border border-amber-500/30 uppercase font-black text-amber-500">Vip</button>
                            </div>
                            <span className="text-[10px] text-gray-600 w-4 font-mono font-bold">R{r}</span>
                            <div className="flex gap-1.5">
                                {seats.filter(s => s.rowNumber === r).sort((a, b) => a.seatNumber - b.seatNumber).map(s => {
                                    const isVip = Number(s.seatType) === 1 || String(s.seatType).toUpperCase() === 'VIP';
                                    return (
                                        <button key={s.id} onClick={() => toggleSeatType(s)}
                                                className={`w-8 h-8 rounded-t-xl rounded-b-md flex items-center justify-center text-[10px] font-black text-white shadow-lg transition-all hover:scale-110
                                            ${isVip ? 'bg-amber-500 border-b-4 border-amber-700' : 'bg-blue-600 border-b-4 border-blue-800'}`}>
                                            {s.seatNumber}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    return (
        <div className="max-w-7xl mx-auto pb-20 p-4 text-white">
            <div className="flex flex-col lg:flex-row gap-8 items-start">
                {/* ЛІВА ЧАСТИНА: ФОРМИ */}
                <div className="w-full lg:w-1/3">
                    {isSeatGenerationMode ? (
                        <div className="bg-[#1a1d26] p-8 rounded-[32px] border border-blue-900/30 shadow-2xl space-y-6">
                            <div className="flex justify-between items-center">
                                <h2 className="text-xl font-black flex items-center gap-3 text-blue-500 uppercase italic"><LayoutGrid size={24} /> Конструктор</h2>
                                <button onClick={() => setIsSeatGenerationMode(false)} className="text-gray-500 hover:text-white transition"><X size={20}/></button>
                            </div>
                            <div className="space-y-6">
                                <select value={selectedHallForSeats} onChange={(e) => setSelectedHallForSeats(Number(e.target.value))} className="w-full p-4 bg-gray-900 border border-gray-700 rounded-2xl text-white outline-none">
                                    <option value="">-- Оберіть зал --</option>
                                    {halls.map(h => <option key={h.id} value={h.id}>{h.name}</option>)}
                                </select>
                                <div className="p-5 bg-gray-900 rounded-3xl border border-gray-800 space-y-4 shadow-inner">
                                    <div className="grid grid-cols-3 gap-2">
                                        <input type="number" value={rowDraft.rowNumber} onChange={(e) => setRowDraft({...rowDraft, rowNumber: Number(e.target.value)})} className="p-3 bg-gray-800 border border-gray-700 rounded-xl text-white text-center outline-none" />
                                        <input type="number" value={rowDraft.seatCount} onChange={(e) => setRowDraft({...rowDraft, seatCount: Number(e.target.value)})} className="p-3 bg-gray-800 border border-gray-700 rounded-xl text-white text-center outline-none" />
                                        <select value={rowDraft.type} onChange={(e) => setRowDraft({...rowDraft, type: Number(e.target.value)})} className="p-3 bg-gray-800 border border-gray-700 rounded-xl text-white outline-none">
                                            <option value={0}>Std</option>
                                            <option value={1}>VIP</option>
                                        </select>
                                    </div>
                                    <button onClick={addRowToDraft} className="w-full flex items-center justify-center gap-2 py-3 bg-blue-600 text-white rounded-xl text-xs font-black uppercase"><ListPlus size={16} /> Додати ряд</button>
                                </div>
                                <div className="space-y-2 max-h-[180px] overflow-y-auto">
                                    {flexibleRows.map((r, i) => (
                                        <div key={i} className="flex items-center justify-between p-3 bg-gray-900 border border-gray-800 rounded-xl">
                                            <span className="text-xs font-bold uppercase tracking-tight">Ряд {r.rowNumber}: {r.seatCount} місць</span>
                                            <div className="flex items-center gap-3">
                                                <span className={`text-[9px] font-black px-2 py-0.5 rounded uppercase ${r.type === 1 ? 'bg-amber-500/20 text-amber-500' : 'bg-blue-500/20 text-blue-500'}`}>{r.type === 1 ? 'VIP' : 'Std'}</span>
                                                <button onClick={() => setFlexibleRows(flexibleRows.filter((_, idx) => idx !== i))} className="text-gray-600 hover:text-red-500"><X size={14}/></button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <button onClick={submitSeatsGeneration} disabled={flexibleRows.length === 0} className="w-full bg-white text-black py-4 rounded-2xl font-black uppercase flex items-center justify-center gap-2 shadow-2xl disabled:opacity-30"><Send size={18} /> ЗГЕНЕРУВАТИ</button>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-[#1a1d26] p-8 rounded-[32px] border border-gray-800 shadow-2xl space-y-6">
                            <h2 className="text-xl font-black flex items-center gap-3 text-red-500 uppercase italic"><Plus size={24} /> Новий зал</h2>
                            <form onSubmit={handleSubmitHall(onSubmitHall)} className="space-y-5">
                                <input {...registerHall('name', { required: true })} className="w-full p-4 bg-gray-900 border border-gray-700 rounded-2xl outline-none text-white shadow-inner" placeholder="Назва залу" />
                                <textarea {...registerHall('description')} className="w-full p-4 bg-gray-900 border border-gray-700 rounded-2xl outline-none text-white h-24 resize-none shadow-inner" placeholder="Опис..." />
                                <input {...registerHall('priceModifier')} type="number" step="0.1" className="w-full p-4 bg-gray-900 border border-gray-700 rounded-2xl outline-none text-white shadow-inner" placeholder="Коефіцієнт (1.0)" />
                                <button disabled={loading} className="w-full bg-red-600 hover:bg-red-700 text-white py-4 rounded-2xl font-black uppercase shadow-lg shadow-red-600/20 disabled:opacity-50">
                                    {loading ? <Loader2 className="animate-spin mx-auto" /> : 'ЗБЕРЕГТИ ЗАЛ'}
                                </button>
                            </form>
                        </div>
                    )}
                </div>

                {/* ПРАВА ЧАСТИНА: СПИСОК */}
                <div className="w-full lg:w-2/3 bg-[#1a1d26] rounded-[40px] border border-gray-800 shadow-2xl overflow-hidden flex flex-col min-h-[600px]">
                    <div className="p-8 border-b border-gray-800 bg-gray-900/30 flex flex-col md:flex-row justify-between items-center gap-4">
                        <h2 className="font-black flex items-center gap-3 text-xl uppercase tracking-tighter italic"><Layers className="text-red-600" size={24} /> Усі кінозали</h2>
                        <div className="flex gap-3 w-full md:w-auto">
                            <div className="relative flex-1 md:w-64">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                                <input type="text" placeholder="Пошук..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full bg-gray-900 border border-gray-700 rounded-xl py-3 pl-11 pr-4 outline-none focus:border-red-500 text-sm transition-all" />
                            </div>
                            <button onClick={() => setIsSeatGenerationMode(true)} className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-xl shadow-lg transition-all active:scale-95"><LayoutGrid size={20}/></button>
                        </div>
                    </div>
                    <div className="p-6 space-y-4 overflow-y-auto flex-1">
                        {filteredHalls.map((h: HallDto) => (
                            <div key={h.id} className="bg-gray-900/50 p-6 rounded-[24px] border border-gray-800 flex justify-between items-center hover:bg-gray-900 transition-all group">
                                <div className="space-y-2">
                                    <h3 className="font-black text-white text-xl tracking-tight uppercase italic group-hover:text-red-500 transition-colors">{h.name}</h3>
                                    <div className="flex gap-3 items-center">
                                        <span className="text-[9px] font-black bg-gray-800 text-gray-400 px-2 py-1 rounded border border-gray-700">ID: {h.id}</span>
                                        <span className={`text-[9px] font-black px-2 py-1 rounded border uppercase tracking-widest ${seatCounts[h.id] > 0 ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20'}`}>Місць: {seatCounts[h.id] || 0}</span>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={() => openScheme(h)} className="p-4 bg-gray-800 hover:bg-blue-600 text-gray-400 hover:text-white rounded-2xl transition-all shadow-inner"><Eye size={22} /></button>
                                    <button onClick={() => handleDeleteHall(h.id)} className="p-4 bg-gray-800 hover:bg-red-600 text-gray-400 hover:text-white rounded-2xl transition-all shadow-inner"><Trash2 size={22} /></button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* MODAL */}
            {selectedHallSeats && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/95 backdrop-blur-md p-4 animate-fade-in">
                    <div className="bg-[#1a1d26] w-full max-w-5xl rounded-[40px] border border-gray-800 shadow-2xl flex flex-col max-h-[95vh]">
                        <div className="p-8 border-b border-gray-800 flex justify-between items-center bg-gray-900/50 rounded-t-[40px]">
                            <div>
                                <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter flex items-center gap-3"><Armchair className="text-red-600" size={28}/> {selectedHallSeats.hallName}</h3>
                                <p className="text-gray-500 text-[10px] font-black uppercase tracking-[0.2em] mt-1">Клікніть на місце для зміни типу</p>
                            </div>
                            <button onClick={() => setSelectedHallSeats(null)} className="p-3 bg-gray-800 hover:bg-gray-700 text-white rounded-full transition-all active:scale-90 shadow-lg"><X size={24} /></button>
                        </div>
                        <div className="p-10 bg-[#0f1117] flex-1 overflow-auto flex items-center justify-center">
                            {renderGrid(selectedHallSeats.seats)}
                        </div>
                        <div className="p-6 bg-gray-900 border-t border-gray-800 rounded-b-[40px] flex justify-center gap-10">
                            <div className="flex items-center gap-3"><div className="w-5 h-5 bg-blue-600 rounded-sm border-b-2 border-blue-800 shadow-lg"></div> <span className="text-[10px] font-black uppercase text-gray-400">Standard</span></div>
                            <div className="flex items-center gap-3"><div className="w-5 h-5 bg-amber-500 rounded-sm border-b-2 border-amber-700 shadow-lg"></div> <span className="text-[10px] font-black uppercase text-gray-400">VIP</span></div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminHalls;