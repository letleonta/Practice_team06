import { useEffect, useState, useMemo } from 'react';
import { ticketService } from '../../services/ticketService';
import type { AdminTicketDto } from '../../types/ticket';
import {
    Ticket, Search, Trash2, Loader2, RefreshCw,
    CircleDollarSign, Hash, Activity, User, MonitorPlay
} from 'lucide-react';

const AdminTickets = () => {
    const [tickets, setTickets] = useState<AdminTicketDto[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [search, setSearch] = useState('');

    const loadTickets = async () => {
        try {
            setIsLoading(true);
            const data = await ticketService.getAll();
            setTickets(data);
        } catch (err) {
            console.error("Failed to load tickets", err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => { loadTickets(); }, []);

    const handleDelete = async (id: number) => {
        if (!confirm('Анулювати цей квиток? Місце в залі знову стане вільним.')) return;
        try {
            await ticketService.delete(id);
            setTickets(prev => prev.filter(t => t.id !== id));
        } catch (err) {
            alert("Помилка при видаленні квитка");
        }
    };

    // Фільтрація за ID (оскільки поки немає назв фільмів у DTO)
    const filteredTickets = useMemo(() => {
        return tickets.filter(t =>
            t.id.toString().includes(search) ||
            t.userId.toString().includes(search)
        ).sort((a, b) => b.id - a.id);
    }, [tickets, search]);

    const totalRevenue = useMemo(() => {
        return filteredTickets.reduce((sum, t) => sum + Number(t.actualPrice), 0);
    }, [filteredTickets]);

    return (
        <div className="max-w-7xl mx-auto text-white animate-fade-in pb-10">
            {/* --- ШВИДКА СТАТИСТИКА --- */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
                <div className="bg-[#1a1d26] p-8 rounded-[32px] border border-gray-800 shadow-xl flex items-center gap-6">
                    <div className="bg-green-500/10 p-4 rounded-2xl text-green-500">
                        <CircleDollarSign size={40}/>
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Загальна виручка</p>
                        <h3 className="text-3xl font-black text-white">{totalRevenue.toLocaleString()} ₴</h3>
                    </div>
                </div>
                <div className="bg-[#1a1d26] p-8 rounded-[32px] border border-gray-800 shadow-xl flex items-center gap-6">
                    <div className="bg-red-600/10 p-4 rounded-2xl text-red-600">
                        <Activity size={40}/>
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Активних квитків</p>
                        <h3 className="text-3xl font-black text-white">{filteredTickets.filter(t => t.isActive).length} шт.</h3>
                    </div>
                </div>
            </div>

            {/* --- HEADER --- */}
            <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-6">
                <h2 className="text-3xl font-black uppercase italic tracking-tighter flex items-center gap-3">
                    <Ticket className="text-red-600" size={32} /> Журнал продажів
                </h2>
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" size={20} />
                    <input
                        type="text"
                        placeholder="Пошук за ID квитка або користувача..."
                        className="w-full bg-[#1a1d26] border border-gray-800 rounded-2xl py-4 pl-12 pr-4 outline-none focus:border-red-600 transition-all text-sm shadow-inner"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>

            {/* --- ТАБЛИЦЯ --- */}
            <div className="bg-[#1a1d26] rounded-[40px] border border-gray-800 overflow-hidden shadow-2xl">
                {isLoading ? (
                    <div className="py-32 flex flex-col items-center justify-center gap-4">
                        <Loader2 className="animate-spin text-red-600" size={48} />
                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-600">Зчитування фінансових даних...</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                            <tr className="bg-gray-900/50 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">
                                <th className="p-6">Квиток</th>
                                <th className="p-6">Користувач (ID)</th>
                                <th className="p-6">Сеанс (ID)</th>
                                <th className="p-6">Сума</th>
                                <th className="p-6">Статус</th>
                                <th className="p-6 text-right">Дії</th>
                            </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-800/50">
                            {filteredTickets.map(t => (
                                <tr key={t.id} className="group hover:bg-white/[0.01] transition-colors text-sm">
                                    <td className="p-6">
                                        <div className="flex items-center gap-2">
                                            <Hash size={14} className="text-red-600" />
                                            <span className="font-black text-white">{t.id}</span>
                                        </div>
                                        <div className="text-[10px] text-gray-600 mt-1">Booking: #{t.bookingId}</div>
                                    </td>
                                    <td className="p-6">
                                        <div className="flex items-center gap-2 text-gray-300 font-bold">
                                            <User size={14} /> <span>ID: {t.userId}</span>
                                        </div>
                                    </td>
                                    <td className="p-6">
                                        <div className="flex items-center gap-2 text-gray-300">
                                            <MonitorPlay size={14} className="text-blue-500" />
                                            <span>Session: {t.sessionId}</span>
                                        </div>
                                        <div className="text-[10px] text-gray-600 mt-1 uppercase">Seat ID: {t.seatId}</div>
                                    </td>
                                    <td className="p-6">
                                        <span className="text-lg font-black text-green-500">{t.actualPrice} ₴</span>
                                    </td>
                                    <td className="p-6">
                                            <span className={`px-2 py-1 rounded-md text-[9px] font-black uppercase border ${
                                                t.isActive
                                                    ? 'bg-green-500/10 text-green-500 border-green-500/20'
                                                    : 'bg-red-500/10 text-red-500 border-red-500/20'
                                            }`}>
                                                {t.isActive ? 'Оплачено' : 'Скасовано'}
                                            </span>
                                    </td>
                                    <td className="p-6 text-right">
                                        <button
                                            onClick={() => handleDelete(t.id)}
                                            className="p-3 text-gray-600 hover:text-red-500 hover:bg-red-500/10 rounded-2xl transition-all opacity-0 group-hover:opacity-100"
                                            title="Видалити квиток"
                                        >
                                            <Trash2 size={20} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* --- FOOTER --- */}
            <div className="mt-8 flex justify-center">
                <button onClick={loadTickets} className="flex items-center gap-2 text-[10px] font-black text-gray-500 hover:text-white transition-all uppercase tracking-[0.3em]">
                    <RefreshCw size={14} /> Оновити звіти
                </button>
            </div>
        </div>
    );
};

export default AdminTickets;