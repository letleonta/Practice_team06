import { useEffect, useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { HallService } from '../../services/hall.service';
import { SeatService } from '../../services/seat.service';
import type { CreateHallDto, HallDto, GenerateFlexibleSeatsDto, RowConfigDto } from '../../types/hall';
import type { SeatDto } from '../../types/seat';
import { SeatType } from '../../types/seat';
import { Layers, Search, Plus, LayoutGrid, Monitor, Eye, X, Armchair, ListPlus, Send, Trash2, Loader2, DollarSign, FileText } from 'lucide-react';

const AdminHalls = () => {
    // Форма створення залу
    const { register: registerHall, handleSubmit: handleSubmitHall, reset: resetHall } = useForm<CreateHallDto>({
        defaultValues: { priceModifier: 1.0 }
    });

    // --- СТАН ---
    const [halls, setHalls] = useState<HallDto[]>([]);
    const [seatCounts, setSeatCounts] = useState<Record<number, number>>({});
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(false);

    // Режими
    const [isSeatGenerationMode, setIsSeatGenerationMode] = useState(false);
    const [selectedHallSeats, setSelectedHallSeats] = useState<{ hallName: string, seats: SeatDto[] } | null>(null);

    // --- СТАН ДЛЯ КОНСТРУКТОРА (Flexible) ---
    const [selectedHallForSeats, setSelectedHallForSeats] = useState<number | "">("");
    const [flexibleRows, setFlexibleRows] = useState<RowConfigDto[]>([]);
    // Чернетка для додавання нового ряду
    const [rowDraft, setRowDraft] = useState<RowConfigDto>({
        rowNumber: 1,
        seatCount: 10,
        type: SeatType.Standard
    });

    // --- ЗАВАНТАЖЕННЯ ДАНИХ ---
    const loadData = async () => {
        try {
            const hallsData = await HallService.getAll();
            setHalls(hallsData);

            // Рахуємо місця
            const counts: Record<number, number> = {};
            const results = await Promise.allSettled(hallsData.map(h => SeatService.getByHallId(h.id)));
            results.forEach((res, i) => {
                counts[hallsData[i].id] = res.status === 'fulfilled' ? res.value.length : 0;
            });
            setSeatCounts(counts);
        } catch (err) { console.error(err); }
    };

    useEffect(() => { loadData(); }, []);

    const filteredHalls = useMemo(() => {
        return halls.filter((h: HallDto) =>
            h.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [halls, searchTerm]);

    // --- ЛОГІКА СТВОРЕННЯ ЗАЛУ ---
    const onSubmitHall = async (data: CreateHallDto) => {
        setLoading(true);
        try {
            const result = await HallService.create({
                ...data,
                priceModifier: Number(data.priceModifier)
            });
            alert(`Зал "${result.name}" створено!`);
            resetHall();
            await loadData();

            // Автоматично переходимо до конструктора для цього залу
            setSelectedHallForSeats(result.id);
            setIsSeatGenerationMode(true);
        } catch (err: any) {
            alert('Помилка: ' + (err.response?.data?.message || 'Невідома помилка'));
        } finally {
            setLoading(false);
        }
    };

    // --- ЛОГІКА КОНСТРУКТОРА (Flexible) ---

    // Додати ряд у список
    const addRowToDraft = () => {
        // Валідація
        if (flexibleRows.some(r => r.rowNumber === rowDraft.rowNumber)) {
            return alert(`Ряд №${rowDraft.rowNumber} вже є у списку!`);
        }
        if (rowDraft.seatCount <= 0) return alert("Кількість місць має бути більше 0");

        // Додаємо і сортуємо за номером ряду
        setFlexibleRows([...flexibleRows, rowDraft].sort((a, b) => a.rowNumber - b.rowNumber));

        // Готуємо наступний ряд (авто-інкремент номера)
        setRowDraft({ ...rowDraft, rowNumber: rowDraft.rowNumber + 1 });
    };

    // Видалити ряд зі списку
    const removeRowFromDraft = (index: number) => {
        setFlexibleRows(flexibleRows.filter((_, i) => i !== index));
    };

    // Відправити на сервер
    const submitFlexibleGeneration = async () => {
        if (!selectedHallForSeats) return alert("Оберіть зал!");
        if (flexibleRows.length === 0) return alert("Додайте хоча б один ряд!");

        if (!window.confirm(`Згенерувати схему для залу ID: ${selectedHallForSeats}? \nЦе видалить старі місця в цьому залі.`)) return;

        try {
            const payload: GenerateFlexibleSeatsDto = {
                hallId: Number(selectedHallForSeats),
                rows: flexibleRows
            };

            await HallService.generateFlexibleSeats(payload);
            alert("Місця успішно згенеровано!");

            // Очистка
            setFlexibleRows([]);
            setRowDraft({ rowNumber: 1, seatCount: 10, type: SeatType.Standard });
            setIsSeatGenerationMode(false);
            await loadData();
        } catch (err: any) {
            console.error(err);
            alert(err.response?.data?.message || "Помилка генерації");
        }
    };

    // --- КЕРУВАННЯ ІСНУЮЧИМИ ЗАЛАМИ ---
    const handleDeleteHall = async (id: number) => {
        if (!window.confirm('Видалити цей зал та всі місця?')) return;
        try {
            await HallService.delete(id);
            loadData();
        } catch (err) { alert("Помилка видалення"); }
    };

    const openScheme = async (hall: HallDto) => {
        try {
            const seats = await SeatService.getByHallId(hall.id);
            if (seats.length === 0) return alert("В залі немає місць");
            setSelectedHallSeats({ hallName: hall.name, seats });
        } catch { alert("Помилка завантаження"); }
    };

    // Редагування окремого місця
    const toggleSeatType = async (seat: SeatDto) => {
        const newType = seat.seatType === SeatType.VIP ? SeatType.Standard : SeatType.VIP;
        try {
            await SeatService.update(seat.id, {
                SeatType: newType,
                priceModifier: newType === SeatType.VIP ? 1.5 : 1.0
            });
            if (selectedHallSeats) {
                const updated = selectedHallSeats.seats.map(s => s.id === seat.id ? { ...s, seatType: newType } : s);
                setSelectedHallSeats({ ...selectedHallSeats, seats: updated });
            }
        } catch { alert("Помилка оновлення"); }
    };

    // Візуалізація
    const renderGrid = (seats: SeatDto[]) => {
        const rows = Array.from(new Set(seats.map(s => s.rowNumber))).sort((a, b) => a - b);
        return (
            <div className="flex flex-col items-center justify-center w-full">
                <div className="w-full max-w-sm mb-12 flex flex-col items-center">
                    <div className="w-full h-1.5 bg-gradient-to-r from-transparent via-blue-500 to-transparent rounded-full shadow-[0_0_15px_rgba(59,130,246,0.6)]"></div>
                    <span className="text-[10px] text-gray-500 uppercase tracking-[0.4em] mt-2 font-black">Екран</span>
                </div>
                <div className="flex flex-col gap-3">
                    {rows.map(r => (
                        <div key={r} className="flex gap-2 items-center justify-center group">
                            <span className="text-[10px] text-gray-600 w-4 font-mono font-bold mr-2">R{r}</span>
                            <div className="flex gap-1.5">
                                {seats.filter(s => s.rowNumber === r).sort((a, b) => a.seatNumber - b.seatNumber).map(s => {
                                    const isVip = Number(s.seatType) === SeatType.VIP || String(s.seatType) === 'VIP';
                                    return (
                                        <button key={s.id} onClick={() => toggleSeatType(s)}
                                                className={`w-7 h-7 rounded-t-lg rounded-b-sm flex items-center justify-center text-[8px] font-black text-white shadow-lg transition-all hover:scale-110
                                            ${isVip ? 'bg-amber-500 border-b-2 border-amber-700' : 'bg-blue-600 border-b-2 border-blue-800'}`}>
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

                {/* ЛІВА КОЛОНКА */}
                <div className="w-full lg:w-1/3">
                    {isSeatGenerationMode ? (
                        // --- ФОРМА КОНСТРУКТОРА (FLEXIBLE) ---
                        <div className="bg-[#1a1d26] p-8 rounded-[32px] border border-blue-900/30 shadow-2xl space-y-6 animate-fade-in">
                            <div className="flex justify-between items-center">
                                <h2 className="text-xl font-black flex items-center gap-3 text-blue-500 uppercase italic">
                                    <LayoutGrid size={24} /> Конструктор
                                </h2>
                                <button onClick={() => setIsSeatGenerationMode(false)} className="text-gray-500 hover:text-white transition"><X size={20}/></button>
                            </div>

                            <div className="space-y-6">
                                {/* Вибір залу */}
                                <div>
                                    <label className="block text-[10px] font-black text-gray-500 mb-2 ml-1 uppercase tracking-widest">Обраний зал</label>
                                    <select
                                        value={selectedHallForSeats}
                                        onChange={(e) => setSelectedHallForSeats(Number(e.target.value))}
                                        className="w-full p-4 bg-gray-900 border border-gray-700 rounded-2xl text-white outline-none cursor-pointer appearance-none shadow-inner"
                                    >
                                        <option value="">-- Оберіть зал --</option>
                                        {halls.map(h => <option key={h.id} value={h.id}>{h.name}</option>)}
                                    </select>
                                </div>

                                {/* Додавання ряду */}
                                <div className="p-5 bg-gray-900 rounded-3xl border border-gray-800 space-y-4 shadow-inner">
                                    <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Конфігурація ряду</p>
                                    <div className="grid grid-cols-3 gap-2">
                                        <div className="space-y-1">
                                            <span className="text-[8px] text-gray-500 uppercase font-bold ml-1">Номер</span>
                                            <input type="number" value={rowDraft.rowNumber} onChange={(e) => setRowDraft({...rowDraft, rowNumber: Number(e.target.value)})} className="w-full p-3 bg-gray-800 border border-gray-700 rounded-xl text-white text-center outline-none focus:border-blue-500" />
                                        </div>
                                        <div className="space-y-1">
                                            <span className="text-[8px] text-gray-500 uppercase font-bold ml-1">Місць</span>
                                            <input type="number" value={rowDraft.seatCount} onChange={(e) => setRowDraft({...rowDraft, seatCount: Number(e.target.value)})} className="w-full p-3 bg-gray-800 border border-gray-700 rounded-xl text-white text-center outline-none focus:border-blue-500" />
                                        </div>
                                        <div className="space-y-1">
                                            <span className="text-[8px] text-gray-500 uppercase font-bold ml-1">Тип</span>
                                            <select
                                                value={rowDraft.type}
                                                onChange={(e) => setRowDraft({...rowDraft, type: Number(e.target.value) as SeatType})}
                                                className="w-full p-3 bg-gray-800 border border-gray-700 rounded-xl text-white outline-none cursor-pointer text-xs"
                                            >
                                                <option value={SeatType.Standard}>Std</option>
                                                <option value={SeatType.VIP}>VIP</option>
                                            </select>
                                        </div>
                                    </div>
                                    <button onClick={addRowToDraft} className="w-full flex items-center justify-center gap-2 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-black uppercase transition-all shadow-lg shadow-blue-600/20">
                                        <ListPlus size={16} /> Додати ряд у список
                                    </button>
                                </div>

                                {/* Список доданих рядів */}
                                <div className="space-y-2 max-h-[200px] overflow-y-auto custom-scrollbar pr-1">
                                    {flexibleRows.length === 0 && <p className="text-center text-xs text-gray-600 py-4">Список рядів порожній</p>}
                                    {flexibleRows.map((r, i) => (
                                        <div key={i} className="flex items-center justify-between p-3 bg-gray-900 border border-gray-800 rounded-xl animate-fade-in">
                                            <span className="text-xs font-bold text-gray-300">Ряд {r.rowNumber}: <span className="text-white">{r.seatCount} місць</span></span>
                                            <div className="flex items-center gap-3">
                                                <span className={`text-[9px] font-black px-2 py-0.5 rounded uppercase ${r.type === SeatType.VIP ? 'bg-amber-500/20 text-amber-500' : 'bg-blue-500/20 text-blue-500'}`}>
                                                    {r.type === SeatType.VIP ? 'VIP' : 'Std'}
                                                </span>
                                                <button onClick={() => removeRowFromDraft(i)} className="text-gray-600 hover:text-red-500 transition-colors"><X size={14}/></button>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="border-t border-gray-800 pt-4">
                                    <button
                                        onClick={submitFlexibleGeneration}
                                        disabled={flexibleRows.length === 0}
                                        className="w-full bg-white hover:bg-gray-200 text-black py-4 rounded-2xl font-black uppercase flex items-center justify-center gap-2 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                                    >
                                        <Send size={18} /> Зберегти конфігурацію
                                    </button>
                                </div>
                            </div>
                        </div>
                    ) : (
                        // --- ФОРМА СТВОРЕННЯ ЗАЛУ ---
                        <div className="bg-[#1a1d26] p-8 rounded-[32px] border border-gray-800 shadow-2xl space-y-6">
                            <h2 className="text-xl font-black flex items-center gap-3 text-red-500 uppercase italic">
                                <Plus size={24} /> Новий зал
                            </h2>
                            <form onSubmit={handleSubmitHall(onSubmitHall)} className="space-y-5">
                                <div>
                                    <label className="block text-[10px] font-black text-gray-500 mb-2 ml-1 uppercase tracking-widest">Назва</label>
                                    <input {...registerHall('name', { required: true })} className="w-full p-4 bg-gray-900 border border-gray-700 rounded-2xl outline-none focus:border-red-500 text-white shadow-inner" placeholder="Напр. Зал IMAX" />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-gray-500 mb-2 ml-1 uppercase tracking-widest flex items-center gap-1"><FileText size={12}/> Опис</label>
                                    <textarea {...registerHall('description')} className="w-full p-4 bg-gray-900 border border-gray-700 rounded-2xl outline-none focus:border-red-500 text-white h-24 resize-none shadow-inner" placeholder="Технічні характеристики..." />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-gray-500 mb-2 ml-1 uppercase tracking-widest flex items-center gap-1"><DollarSign size={12}/> Коефіцієнт ціни</label>
                                    <input {...registerHall('priceModifier')} type="number" step="0.1" className="w-full p-4 bg-gray-900 border border-gray-700 rounded-2xl outline-none focus:border-red-500 text-white shadow-inner" placeholder="1.0" />
                                </div>
                                <button disabled={loading} className="w-full bg-red-600 hover:bg-red-700 text-white py-4 rounded-2xl font-black uppercase shadow-lg shadow-red-600/20 active:scale-95 transition-all disabled:opacity-50">
                                    {loading ? <Loader2 className="animate-spin mx-auto" /> : 'ЗБЕРЕГТИ ЗАЛ'}
                                </button>
                            </form>
                        </div>
                    )}
                </div>

                {/* ПРАВА ЧАСТИНА: СПИСОК (Без змін) */}
                <div className="w-full lg:w-2/3 bg-[#1a1d26] rounded-[40px] border border-gray-800 shadow-2xl overflow-hidden flex flex-col min-h-[600px]">
                    <div className="p-8 border-b border-gray-800 bg-gray-900/30 flex justify-between items-center gap-4">
                        <h2 className="font-black flex items-center gap-3 text-xl uppercase tracking-tighter italic text-white">
                            <Layers className="text-red-600" size={24} /> Усі кінозали
                        </h2>
                        <div className="flex gap-3 w-full md:w-auto">
                            <div className="relative flex-1 md:w-64">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                                <input type="text" placeholder="Пошук..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full bg-gray-900 border border-gray-700 rounded-xl py-3 pl-11 pr-4 outline-none focus:border-red-500 text-sm transition-all text-white" />
                            </div>
                            <button onClick={() => setIsSeatGenerationMode(true)} className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-xl shadow-lg transition-all active:scale-95" title="Конструктор місць"><LayoutGrid size={20}/></button>
                        </div>
                    </div>
                    <div className="p-6 space-y-4 overflow-y-auto flex-1 custom-scrollbar">
                        {filteredHalls.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-64 text-gray-600 opacity-40"><Monitor size={48} className="mb-4" /><p className="font-bold uppercase tracking-widest">Залів не знайдено</p></div>
                        ) : (
                            filteredHalls.map((h: HallDto) => (
                                <div key={h.id} className="bg-gray-900/50 p-6 rounded-[24px] border border-gray-800 flex justify-between items-center hover:bg-gray-900 transition-all group">
                                    <div className="space-y-2">
                                        <h3 className="font-black text-white text-xl tracking-tight uppercase italic group-hover:text-red-500 transition-colors">{h.name}</h3>
                                        <div className="flex gap-3 items-center">
                                            <span className="text-[9px] font-black bg-gray-800 text-gray-400 px-2 py-1 rounded border border-gray-700">ID: {h.id}</span>
                                            <span className={`text-[9px] font-black px-2 py-1 rounded border uppercase tracking-widest ${seatCounts[h.id] > 0 ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20'}`}>Місць: {seatCounts[h.id] || 0}</span>
                                            {h.description && <span className="text-[10px] text-gray-500 italic truncate max-w-[200px] hidden sm:block">— {h.description}</span>}
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <button onClick={() => openScheme(h)} className="p-4 bg-gray-800 hover:bg-blue-600 text-gray-400 hover:text-white rounded-2xl shadow-inner transition-all"><Eye size={22} /></button>
                                        <button onClick={() => handleDeleteHall(h.id)} className="p-4 bg-gray-800 hover:bg-red-600 text-gray-400 hover:text-white rounded-2xl shadow-inner transition-all"><Trash2 size={22} /></button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* MODAL SCHEME (Без змін) */}
            {selectedHallSeats && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/95 backdrop-blur-md p-4 animate-fade-in">
                    <div className="bg-[#1a1d26] w-full max-w-5xl rounded-[40px] border border-gray-700 shadow-2xl flex flex-col max-h-[90vh]">
                        <div className="p-8 border-b border-gray-800 flex justify-between items-center bg-gray-900/50 rounded-t-[40px]">
                            <div>
                                <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter flex items-center gap-3"><Armchair className="text-red-600" size={28}/> {selectedHallSeats.hallName}</h3>
                                <p className="text-gray-500 text-[10px] font-black uppercase tracking-[0.2em] mt-1">Всього {selectedHallSeats.seats.length} місць в системі</p>
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