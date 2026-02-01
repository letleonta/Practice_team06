import { useEffect, useState, useCallback, useMemo } from 'react';
import {
    Search, Filter, ArrowUpDown, X, Eye,
    Calendar, Clock, User, Film, Ticket as TicketIcon,
    ArrowLeft, ArrowRight, Loader2, TrendingDown, TrendingUp
} from 'lucide-react';
import { getStatusColor, getStatusText } from '../../utils/bookingStatus';
import { getAgeRestrictionText } from '../../utils/ageRestriction';
import api from '../../api/axiosInstance';
import type {AdminBookingDto, BookingStatus, SortBy} from "../../types/booking.ts";
import {formatDate, formatTime} from "../../utils/timeFormat.ts";

const STATUS_OPTIONS: { value: BookingStatus; label: string }[] = [
    { value: null,          label: 'Усі статуси' },
    { value: 'Inprogress',     label: 'Активні' },
    { value: 'Paid',  label: 'Завершені' },
    { value: 'Cancelled',  label: 'Скасовані' },
];

const SORT_OPTIONS: { value: SortBy; label: string }[] = [
    { value: 'date',   label: 'Дата бронювання' },
    { value: 'status', label: 'Статус' },
    { value: 'userId', label: 'ID користувача' }
];

const StatCard = ({ label, value, accent }: { label: string; value: string | number; accent?: string }) => (
    <div className="bg-[#1a1d26] border border-gray-800 rounded-xl p-4 flex flex-col gap-1">
        <span className="text-gray-500 text-xs uppercase tracking-wider">{label}</span>
        <span className={`text-2xl font-black ${accent || 'text-white'}`}>{value}</span>
    </div>
);

// ─── Main page ───────────────────────────────────────────────────────────────

const AdminBookingsPage = () => {
    // ── state ──
    const [bookings, setBookings]       = useState<AdminBookingDto[]>([]);
    const [loading, setLoading]         = useState(true);
    const [search, setSearch]           = useState('');
    const [statusFilter, setStatusFilter] = useState<BookingStatus>(null);
    const [sortBy, setSortBy]           = useState<SortBy>('date');
    const [isDesc, setIsDesc]           = useState(true);
    const [sessionFrom, setSessionFrom] = useState('');
    const [sessionTo, setSessionTo]     = useState('');
    const [filtersOpen, setFiltersOpen] = useState(false);
    const [page, setPage]               = useState(1);
    const [selectedBooking, setSelectedBooking] = useState<AdminBookingDto | null>(null);

    const PAGE_SIZE = 12;

    // ── fetch ──
    const fetchBookings = useCallback(async () => {
        setLoading(true);
        try {
            const params: Record<string, any> = {};
            if (statusFilter)  params.Status        = statusFilter;
            if (sortBy)         params.SortBy        = sortBy;
            params.IsDescending = isDesc;
            if (sessionFrom)    params.SessionFromDate = sessionFrom;
            if (sessionTo)      params.SessionToDate   = sessionTo;

            const res = await api.get<AdminBookingDto[]>('/bookings', { params });
            setBookings(res.data);
            setPage(1);
        } catch (e) {
            console.error('Fetch error', e);
        } finally {
            setLoading(false);
        }
    }, [statusFilter, sortBy, isDesc, sessionFrom, sessionTo]);

    useEffect(() => { fetchBookings(); }, [fetchBookings]);

    // ── client-side search (by id or title) ──
    const filtered = useMemo(() => {
        if (!search) return bookings;
        const q = search.toLowerCase();
        return bookings.filter(b =>
            String(b.id).includes(q) ||
            (b.title || '').toLowerCase().includes(q)
        );
    }, [bookings, search]);

    // ── pagination slice ──
    const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
    const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

    // ── stats ──
    const stats = useMemo(() => ({
        total:     bookings.length,
        inprogress:    bookings.filter(b => b.status === 'Inprogress').length,
        paid: bookings.filter(b => b.status === 'Paid').length,
        cancelled: bookings.filter(b => b.status === 'Cancelled').length,
    }), [bookings]);

    // ── handlers ──
    const toggleSort = (field: SortBy) => {
        if (sortBy === field) setIsDesc(d => !d);
        else { setSortBy(field); setIsDesc(true); }
    };

    const SortIcon = ({ field }: { field: SortBy }) => {
        if (sortBy !== field) return <ArrowUpDown size={14} className="text-gray-600" />;
        return isDesc
            ? <TrendingDown size={14} className="text-red-500" />
            : <TrendingUp size={14} className="text-red-500" />;
    };

    // ─── render ──────────────────────────────────────────────────────────────

    return (
        <div className="min-h-screen bg-[#0f1117] text-white font-sans">
            <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">

                {/* ── Header ── */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <h1 className="text-3xl font-black">
                        Адмін <span className="text-red-600">бронювань</span>
                    </h1>
                    <button
                        onClick={fetchBookings}
                        className="self-start sm:self-auto px-4 py-2 rounded-lg bg-[#1a1d26] border border-gray-700 text-gray-300 text-sm hover:border-red-600/50 hover:text-white transition-all"
                    >
                        Оновити
                    </button>
                </div>

                {/* ── Stats row ── */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                    <StatCard label="Всього"     value={stats.total}     />
                    <StatCard label="Активні" value={stats.inprogress} accent="text-emerald-400" />
                    <StatCard label="Завершені" value={stats.paid} accent="text-blue-400"    />
                    <StatCard label="Скасовані"  value={stats.cancelled} accent="text-red-400"     />
                </div>

                {/* ── Search + filter toggle row ── */}
                <div className="flex flex-col sm:flex-row gap-3">
                    {/* search */}
                    <div className="relative flex-1">
                        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" />
                        <input
                            type="text"
                            placeholder="Пошук за ID або назвою фільму…"
                            value={search}
                            onChange={e => { setSearch(e.target.value); setPage(1); }}
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#1a1d26] border border-gray-700 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-red-600/50 transition-colors"
                        />
                        {search && (
                            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-white transition-colors">
                                <X size={16} />
                            </button>
                        )}
                    </div>

                    {/* filter toggle */}
                    <button
                        onClick={() => setFiltersOpen(o => !o)}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-semibold transition-all
                            ${filtersOpen
                            ? 'bg-red-600/15 border-red-600/40 text-red-400'
                            : 'bg-[#1a1d26] border-gray-700 text-gray-400 hover:border-red-600/40 hover:text-white'
                        }`}
                    >
                        <Filter size={16} /> Фільтри
                        {(statusFilter || sessionFrom || sessionTo) && (
                            <span className="ml-1 w-2 h-2 rounded-full bg-red-600 inline-block" />
                        )}
                    </button>
                </div>

                {/* ── Expanded filters panel ── */}
                {filtersOpen && (
                    <div className="bg-[#1a1d26] border border-gray-800 rounded-2xl p-5 space-y-4 animate-[fadeDown_0.2s_ease]">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

                            {/* Status pills */}
                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs text-gray-500 uppercase tracking-wider">Статус</label>
                                <div className="flex flex-wrap gap-2">
                                    {STATUS_OPTIONS.map(opt => {
                                        const active = statusFilter === opt.value;
                                        return (
                                            <button
                                                key={String(opt.value)}
                                                onClick={() => { setStatusFilter(opt.value); setPage(1); }}
                                                className={`px-3 py-1 rounded-full text-xs font-semibold transition-all
                                                    ${active
                                                    ? 'bg-red-600 text-white shadow-md shadow-red-600/25'
                                                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white'
                                                }`}
                                            >
                                                {opt.label}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Session date from */}
                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs text-gray-500 uppercase tracking-wider">Сеанс від</label>
                                <input
                                    type="date"
                                    value={sessionFrom}
                                    onChange={e => { setSessionFrom(e.target.value); setPage(1); }}
                                    className="px-3 py-2 rounded-lg bg-gray-800 border border-gray-700 text-sm text-white focus:outline-none focus:border-red-600/50 transition-colors"
                                />
                            </div>

                            {/* Session date to */}
                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs text-gray-500 uppercase tracking-wider">Сеанс до</label>
                                <input
                                    type="date"
                                    value={sessionTo}
                                    onChange={e => { setSessionTo(e.target.value); setPage(1); }}
                                    className="px-3 py-2 rounded-lg bg-gray-800 border border-gray-700 text-sm text-white focus:outline-none focus:border-red-600/50 transition-colors"
                                />
                            </div>

                            {/* Reset */}
                            <div className="flex items-end">
                                <button
                                    onClick={() => { setStatusFilter(null); setSessionFrom(''); setSessionTo(''); setPage(1); }}
                                    className="px-4 py-2 rounded-lg text-xs text-gray-500 hover:text-red-400 transition-colors"
                                >
                                    Сбросити фільтри
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* ── Table ── */}
                <div className="bg-[#1a1d26] border border-gray-800 rounded-2xl overflow-hidden shadow-xl">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                            <tr className="border-b border-gray-800 bg-[#161820]">
                                <th className="text-left px-4 py-3 text-gray-500 font-semibold uppercase text-xs tracking-wider w-24">№</th>
                                <th className="text-left px-4 py-3 text-gray-500 font-semibold uppercase text-xs tracking-wider">Фільм</th>
                                <th className="text-left px-4 py-3 text-gray-500 font-semibold uppercase text-xs tracking-wider">
                                    <button onClick={() => toggleSort('userId')} className="flex items-center gap-1.5 hover:text-white transition-colors">
                                        User ID <SortIcon field="userId" />
                                    </button>
                                </th>
                                <th className="text-left px-4 py-3 text-gray-500 font-semibold uppercase text-xs tracking-wider">Сеанс</th>
                                <th className="text-left px-4 py-3 text-gray-500 font-semibold uppercase text-xs tracking-wider">
                                    <button onClick={() => toggleSort('date')} className="flex items-center gap-1.5 hover:text-white transition-colors">
                                        Час броні <SortIcon field="date" />
                                    </button>
                                </th>
                                <th className="text-left px-4 py-3 text-gray-500 font-semibold uppercase text-xs tracking-wider">
                                    <button onClick={() => toggleSort('status')} className="flex items-center gap-1.5 hover:text-white transition-colors">
                                        Статус <SortIcon field="status" />
                                    </button>
                                </th>
                                <th className="text-right px-4 py-3 text-gray-500 font-semibold uppercase text-xs tracking-wider">Сума</th>
                                <th className="px-4 py-3 w-12" />
                            </tr>
                            </thead>

                            <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={8} className="py-16 text-center">
                                        <Loader2 size={32} className="animate-spin text-red-600 mx-auto mb-3" />
                                        <p className="text-gray-500">Завантаження…</p>
                                    </td>
                                </tr>
                            ) : paginated.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="py-16 text-center">
                                        <TicketIcon size={40} className="text-gray-700 mx-auto mb-3" />
                                        <p className="text-gray-500">Немає бронювань</p>
                                    </td>
                                </tr>
                            ) : paginated.map((b, i) => (
                                <tr
                                    key={b.id}
                                    className="border-b border-gray-800/60 hover:bg-[#22252f] transition-colors group cursor-pointer"
                                    onClick={() => setSelectedBooking(b)}
                                >
                                    <td className="px-4 py-3 text-red-600 font-bold">#{b.id}</td>

                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-3">
                                            {b.posterUri ? (
                                                <img src={b.posterUri} alt={b.title} className="w-8 h-12 object-cover rounded bg-gray-900" />
                                            ) : (
                                                <div className="w-8 h-12 bg-gray-800 rounded flex items-center justify-center">
                                                    <Film size={14} className="text-gray-600" />
                                                </div>
                                            )}
                                            <div>
                                                <p className="text-white font-semibold">{b.title}</p>
                                                {b.ageRestriction && (
                                                    <span className="text-xs bg-red-600/20 text-red-400 px-2 py-0.5 rounded-full">
                                                            {getAgeRestrictionText(b.ageRestriction)}
                                                        </span>
                                                )}
                                            </div>
                                        </div>
                                    </td>

                                    <td className="px-4 py-3 text-gray-400 font-mono text-xs">{b.userId ?? '-'}</td>

                                    <td className="px-4 py-3 text-gray-300 whitespace-nowrap">
                                        <p>{formatDate(b.startTime)}</p>
                                        <p className="text-gray-600 text-xs">{formatTime(b.startTime)}</p>
                                    </td>

                                    <td className="px-4 py-3 text-gray-300 whitespace-nowrap">
                                        <p>{formatDate(b.bookingTime)}</p>
                                        <p className="text-gray-600 text-xs">{formatTime(b.bookingTime)}</p>
                                    </td>

                                    <td className="px-4 py-3">
                                            <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(b.status)}`}>
                                                {getStatusText(b.status)}
                                            </span>
                                    </td>

                                    <td className="px-4 py-3 text-right text-red-500 font-black">{b.totalPrice}₴</td>

                                    <td className="px-4 py-3 text-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={e => { e.stopPropagation(); setSelectedBooking(b); }}
                                            className="text-gray-500 hover:text-red-500 transition-colors"
                                        >
                                            <Eye size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>

                    {/* ── Pagination ── */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-between px-4 py-3 border-t border-gray-800 bg-[#161820]">
                            <span className="text-xs text-gray-500">
                                {((page - 1) * PAGE_SIZE) + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} з {filtered.length}
                            </span>
                            <div className="flex items-center gap-1">
                                <button
                                    disabled={page === 1}
                                    onClick={() => setPage(p => p - 1)}
                                    className="p-1.5 rounded-lg text-gray-500 hover:text-white hover:bg-gray-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                                >
                                    <ArrowLeft size={16} />
                                </button>
                                {Array.from({ length: totalPages }, (_, i) => i + 1)
                                    .filter(n => n === 1 || n === totalPages || Math.abs(n - page) <= 1)
                                    .reduce<(number | '…')[]>((acc, n, idx, arr) => {
                                        if (idx > 0 && n - (arr[idx - 1] as number) > 1) acc.push('…');
                                        acc.push(n);
                                        return acc;
                                    }, [])
                                    .map((n, i) =>
                                        n === '…' ? (
                                            <span key={`e${i}`} className="text-gray-600 px-1">…</span>
                                        ) : (
                                            <button
                                                key={n}
                                                onClick={() => setPage(n as number)}
                                                className={`w-8 h-8 rounded-lg text-xs font-semibold transition-all
                                                    ${page === n
                                                    ? 'bg-red-600 text-white shadow-md shadow-red-600/30'
                                                    : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                                                }`}
                                            >
                                                {n}
                                            </button>
                                        )
                                    )}
                                <button
                                    disabled={page === totalPages}
                                    onClick={() => setPage(p => p + 1)}
                                    className="p-1.5 rounded-lg text-gray-500 hover:text-white hover:bg-gray-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                                >
                                    <ArrowRight size={16} />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* ── Detail Modal ── */}
            {selectedBooking && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4"
                    onClick={() => setSelectedBooking(null)}
                >
                    <div
                        className="bg-[#1a1d26] border border-gray-800 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl"
                        onClick={e => e.stopPropagation()}
                    >
                        {/* modal header */}
                        <div className="flex items-center justify-between p-5 border-b border-gray-800 bg-gradient-to-r from-red-600/10 to-transparent rounded-t-2xl">
                            <h2 className="text-lg font-black">
                                Бронювання <span className="text-red-600">#{selectedBooking.id}</span>
                            </h2>
                            <div className="flex items-center gap-3">
                                <span className={`px-3 py-0.5 rounded-full text-xs font-semibold border ${getStatusColor(selectedBooking.status)}`}>
                                    {getStatusText(selectedBooking.status)}
                                </span>
                                <button onClick={() => setSelectedBooking(null)} className="text-gray-500 hover:text-white transition-colors">
                                    <X size={20} />
                                </button>
                            </div>
                        </div>

                        {/* modal body */}
                        <div className="p-5 space-y-5">
                            {/* movie row */}
                            <div className="flex gap-4">
                                {selectedBooking.posterUri ? (
                                    <img src={selectedBooking.posterUri} alt={selectedBooking.title} className="w-20 h-32 object-cover rounded-lg bg-gray-900 shrink-0" />
                                ) : (
                                    <div className="w-20 h-32 bg-gray-800 rounded-lg flex items-center justify-center shrink-0">
                                        <Film size={28} className="text-gray-600" />
                                    </div>
                                )}
                                <div className="flex flex-col justify-between py-1">
                                    <div>
                                        <h3 className="text-white font-bold text-lg">{selectedBooking.title}</h3>
                                        {selectedBooking.ageRestriction && (
                                            <span className="text-xs bg-red-600/20 text-red-400 px-2 py-0.5 rounded-full">
                                                {getAgeRestrictionText(selectedBooking.ageRestriction)}
                                            </span>
                                        )}
                                    </div>
                                    <div className="space-y-1.5 text-sm">
                                        <div className="flex items-center gap-2 text-gray-400">
                                            <User size={14} className="text-red-600" />
                                            <span>User ID: <span className="text-gray-200 font-mono">{selectedBooking.UserId ?? '—'}</span></span>
                                        </div>
                                        <div className="flex items-center gap-2 text-gray-400">
                                            <Calendar size={14} className="text-red-600" />
                                            <span>Сеанс: <span className="text-gray-200">{formatDate(selectedBooking.startTime)} в {formatTime(selectedBooking.startTime)}</span></span>
                                        </div>
                                        <div className="flex items-center gap-2 text-gray-400">
                                            <Clock size={14} className="text-red-600" />
                                            <span>Бронювано: <span className="text-gray-200">{formatDate(selectedBooking.bookingTime)} в {formatTime(selectedBooking.bookingTime)}</span></span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <div className="flex items-center justify-between mb-3">
                                    <h4 className="text-sm font-semibold text-gray-300 flex items-center gap-2">
                                        <TicketIcon size={15} className="text-red-600" /> Квитки
                                    </h4>
                                    <span className="text-xs text-gray-600">{selectedBooking.tickets.length} шт.</span>
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    {selectedBooking.tickets.map((t, i) => (
                                        <div key={i} className="bg-gray-800/60 border border-gray-700 rounded-xl p-3 flex items-center justify-between">
                                            <div>
                                                <p className="text-xs text-gray-500">Ряд {t.rowNumber} · Місце {t.seatNumber}</p>
                                                <p className="text-white font-semibold text-sm mt-0.5">Квиток #{i + 1}</p>
                                            </div>
                                            <span className="text-red-500 font-black text-base">{t.actualPrice}₴</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* total */}
                            <div className="flex items-center justify-between pt-4 border-t border-gray-700">
                                <span className="text-gray-500 text-sm">Загальна сума</span>
                                <span className="text-3xl font-black text-red-600">{selectedBooking.totalPrice}₴</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                @keyframes fadeDown {
                    from { opacity: 0; transform: translateY(-8px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
};

export default AdminBookingsPage;