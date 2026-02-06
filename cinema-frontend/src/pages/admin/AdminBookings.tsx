import {useState} from 'react';
import {
    Search, Filter, X, Eye,
    Calendar, Clock, User, Film, Ticket as TicketIcon,
    TrendingUp, ChevronDown, Ticket, CreditCard
} from 'lucide-react';
import { getStatusColor, getStatusText } from '../../utils/formatBookingStatus';
import {type BookingsStatsDto, BookingStatus} from "../../types/booking.ts";
import type { AdminBookingDto, BookingFilterDto } from "../../types/booking.ts";
import { BookingService } from "../../services/booking.service";
import { formatDateWithYear, formatTime } from "../../utils/formatTime";
import { Pagination } from "../../components/Pagination";
import { PaginationInfo } from "../../components/PaginationInfo";
import {UsePagination} from "../../hooks/UsePagination.ts";
import {AgeRestrictionBadge} from "../../components/AgeRestrictionBadge.tsx";
import StatusPie from "../../components/ui/StatusPie.tsx";
import RevenueChart from "../../components/ui/RevenueChart.tsx";
import {SimpleBarChart} from "../../components/ui/SimpleBarChart.tsx";
import {BookingFilters} from "../../components/BookingFilters.tsx";
import {DataTable, type Column} from "../../components/DataTable.tsx";

type StatusFilter = BookingStatus | 'ALL';
type SortBy = 'date' | 'status' | 'userEmail';

const AdminBookingsPage = () => {
    // Filter state
    const [stats, setStats] = useState<BookingsStatsDto | null>(null);
    const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');
    const [sessionFrom, setSessionFrom] = useState('');
    const [sessionTo, setSessionTo] = useState('');
    const [bookingFrom, setBookingFrom] = useState('');
    const [bookingTo, setBookingTo] = useState('');
    const [userEmail, setUserEmail] = useState('');
    const [searchQuery, setSearchQuery] = useState('');

    // Sort state
    const [sortBy, setSortBy] = useState<SortBy>('date');
    const [isDesc, setIsDesc] = useState(true);

    // UI state
    const [filtersOpen, setFiltersOpen] = useState(false);
    const [selectedBooking, setSelectedBooking] = useState<AdminBookingDto | null>(null);

    // Fetch function for pagination hook
    const fetchBookings = async (Page: number, PageSize: number) => {
        const filter: BookingFilterDto = {
            Status: statusFilter !== 'ALL' ? statusFilter : undefined,
            SessionFromDate: sessionFrom || undefined,
            SessionToDate: sessionTo || undefined,
            BookingFromDate: bookingFrom || undefined,
            BookingToDate: bookingTo || undefined,
            UserEmail: userEmail || undefined,
            SearchQuery: searchQuery || undefined,
            SortBy: sortBy,
            IsDescending: isDesc,
            Page: Page,
            PageSize: PageSize,
        };

        const response = await BookingService.getAllBookings(filter);
        setStats(response.stats);
        return response.bookingsPage;
    };

    // Use pagination hook
    const {
        items: bookings,
        totalCount,
        currentPage,
        totalPages,
        pageSize,
        loading,
        error,
        goToPage
    } = UsePagination(
        fetchBookings,
        [statusFilter, sessionFrom, sessionTo, bookingFrom, bookingTo, userEmail, searchQuery, sortBy, isDesc],
        { pageSize: 6 }
    );

    // Sort handler
    const handleSort = (sortKey: string) => {
        if (sortBy === sortKey) {
            setIsDesc(!isDesc);
        } else {
            setSortBy(sortKey as SortBy);
            setIsDesc(true);
        }
    };

    // Helpers
    const hasActiveFilters = statusFilter !== 'ALL' || sessionFrom || sessionTo || bookingFrom || bookingTo || userEmail;

    const resetAllFilters = () => {
        setStatusFilter('ALL');
        setSessionFrom('');
        setSessionTo('');
        setBookingFrom('');
        setBookingTo('');
        setUserEmail('');
        setSearchQuery('');
    };

    // Define columns for DataTable
    const columns: Column<AdminBookingDto>[] = [
        {
            key: 'id',
            header: '№',
            width: 'w-24',
            render: (booking) => (
                <span className="text-red-600 font-bold">#{booking.id}</span>
            )
        },
        {
            key: 'movie',
            header: 'Фільм',
            render: (booking) => (
                <div className="flex items-center gap-3">
                    <div className="shrink-0">
                        {booking.posterUri ? (
                            <img
                                src={booking.posterUri}
                                alt={booking.title}
                                className="w-8 h-12 object-cover rounded bg-gray-900"
                            />
                        ) : (
                            <div className="w-8 h-12 bg-gray-800 rounded flex items-center justify-center">
                                <Film size={14} className="text-gray-600" />
                            </div>
                        )}
                    </div>
                    <div className="flex flex-col items-start gap-1">
                        <p className="text-white font-semibold leading-tight line-clamp-1">
                            {booking.title}
                        </p>
                        <AgeRestrictionBadge
                            restriction={booking.ageRestriction}
                            className="bg-red-600/20 text-red-400 border border-red-600/30 px-1.5 py-0.5 rounded text-[10px]"
                        />
                    </div>
                </div>
            )
        },
        {
            key: 'userEmail',
            header: 'User Email',
            sortable: true,
            sortKey: 'userEmail',
            render: (booking) => (
                <span className="text-gray-400 font-mono text-sm">{booking.userEmail}</span>
            )
        },
        {
            key: 'session',
            header: 'Сеанс',
            render: (booking) => (
                <div className="whitespace-nowrap">
                    <p className="text-gray-300">{formatDateWithYear(booking.startTime)}</p>
                    <p className="text-gray-600 text-xs">{formatTime(booking.startTime)}</p>
                </div>
            )
        },
        {
            key: 'bookingTime',
            header: 'Час броні',
            sortable: true,
            sortKey: 'date',
            render: (booking) => (
                <div className="whitespace-nowrap">
                    <p className="text-gray-300">{formatDateWithYear(booking.bookingTime)}</p>
                    <p className="text-gray-600 text-xs">{formatTime(booking.bookingTime)}</p>
                </div>
            )
        },
        {
            key: 'status',
            header: 'Статус',
            sortable: true,
            sortKey: 'status',
            render: (booking) => (
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(booking.status)}`}>
                    {getStatusText(booking.status)}
                </span>
            )
        },
        {
            key: 'totalPrice',
            header: 'Сума',
            align: 'right',
            render: (booking) => (
                <span className="text-red-500 font-black">{booking.totalPrice}₴</span>
            )
        },
        {
            key: 'actions',
            header: '',
            width: 'w-12',
            align: 'center',
            render: (booking) => (
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        setSelectedBooking(booking);
                    }}
                    className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-500 hover:text-red-500"
                >
                    <Eye size={18} />
                </button>
            )
        }
    ];

    return (
        <div className="min-h-screen text-white font-sans">
            <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-3xl font-black flex items-center gap-3 tracking-tighter uppercase">
                            <Ticket className="text-red-600" size={32} /> Керування бронюваннями
                        </h2>
                        <p className="text-gray-500">
                            Перегляд та керування всіма бронюваннями
                            {totalCount > 0 && (
                                <span className="ml-2 text-green-600 font-semibold">
                                    ({totalCount})
                                </span>
                            )}
                        </p>
                    </div>
                </div>

                {/* Analytics */}
                {stats && !loading && (
                    <div className="max-w-7xl mx-auto w-full flex flex-col gap-6">
                        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                            <div className="lg:col-span-3 min-w-0">
                                <RevenueChart data={stats.revenuePoints} />
                            </div>

                            <div className="flex flex-col gap-6">
                                <div className="bg-[#1a1d26] border border-gray-800 rounded-3xl flex items-center justify-center gap-4 p-6 flex-1 shadow-sm">
                                    <div className="bg-emerald-500/10 p-4 rounded-2xl">
                                        <TrendingUp className="text-emerald-500" size={28} />
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 uppercase font-bold tracking-widest mb-1">Загальний дохід</p>
                                        <p className="text-3xl font-black text-white">{stats.totalRevenue?.toLocaleString()} ₴</p>
                                    </div>
                                </div>

                                <div className="bg-[#1a1d26] border border-gray-800 rounded-3xl flex items-center justify-center gap-4 p-6 flex-1 shadow-sm">
                                    <div className="bg-blue-500/10 p-4 rounded-2xl">
                                        <CreditCard className="text-blue-500" size={28} />
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 uppercase font-bold tracking-widest mb-1">Середній чек</p>
                                        <p className="text-3xl font-black text-white">
                                            {stats.paidCount > 0 ? Math.round(stats.totalRevenue / stats.paidCount).toLocaleString() : 0} ₴
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <StatusPie stats={stats} />

                            <SimpleBarChart
                                data={stats.hallPoints}
                                dataKey="number"
                                dataLabel="Прибуток"
                                nameKey="hallName"
                                color="#3b82f6"
                                chartName="Найприбутковіші зали"
                            />

                            <SimpleBarChart
                                data={stats.genrePoints}
                                dataKey="number"
                                dataLabel="Кількість квитків"
                                nameKey="genreName"
                                color="#8b5cf6"
                                chartName="Жанри-лідери"
                            />
                        </div>
                    </div>
                )}

                {/* Search + Filters toggle */}
                <div className="flex flex-col sm:flex-row gap-3">
                    {/* search */}
                    <div className="relative flex-1">
                        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" />
                        <input
                            type="text"
                            placeholder="Пошук за ID або назвою фільму…"
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#1a1d26] border border-gray-700 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-red-600/50 transition-colors"
                        />
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery('')}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-white transition-colors"
                            >
                                <X size={16} />
                            </button>
                        )}
                    </div>

                    {/* filters toggle button */}
                    <button
                        onClick={() => setFiltersOpen(o => !o)}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-semibold transition-all ${
                            filtersOpen
                                ? 'bg-red-600/15 border-red-600/40 text-red-400'
                                : 'bg-[#1a1d26] border-gray-700 text-gray-400 hover:border-red-600/40 hover:text-white'
                        }`}
                    >
                        <Filter size={16} /> Фільтри
                        <ChevronDown size={14} className={`transition-transform ${filtersOpen ? 'rotate-180' : ''}`} />
                        {hasActiveFilters && !filtersOpen && (
                            <span className="ml-1 w-2 h-2 rounded-full bg-red-600 inline-block" />
                        )}
                    </button>

                    {hasActiveFilters && (
                        <button
                            onClick={resetAllFilters}
                            className="px-4 py-2.5 rounded-xl border border-gray-700 bg-[#1a1d26] text-xs text-gray-500 hover:text-red-400 hover:border-red-600/40 transition-all"
                        >
                            Скинути все
                        </button>
                    )}
                </div>

                {/* Filters panel */}
                {filtersOpen && (
                    <div className="bg-[#1a1d26] border border-gray-800 rounded-2xl p-5 animate-[fadeDown_0.2s_ease]">
                        <BookingFilters
                            userEmail={userEmail}
                            setUserEmail={setUserEmail}
                            sessionFrom={sessionFrom}
                            setSessionFrom={setSessionFrom}
                            sessionTo={sessionTo}
                            setSessionTo={setSessionTo}
                            bookingFrom={bookingFrom}
                            setBookingFrom={setBookingFrom}
                            bookingTo={bookingTo}
                            setBookingTo={setBookingTo}
                        />
                    </div>
                )}

                {/* DataTable */}
                <DataTable
                    data={bookings}
                    columns={columns}
                    loading={loading}
                    error={error}
                    emptyMessage="Немає бронювань"
                    emptyIcon={<TicketIcon size={40} className="text-gray-700 mx-auto" />}
                    onRowClick={setSelectedBooking}
                    sortConfig={{ sortBy, isDesc }}
                    onSort={handleSort}
                />

                {/* Pagination */}
                {!loading && !error && totalPages > 0 && (
                    <div className="border-t border-gray-800 bg-[#161820] p-4 rounded-2xl">
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                            <PaginationInfo
                                currentPage={currentPage}
                                pageSize={pageSize}
                                totalCount={totalCount}
                                itemName="бронювання"
                                className="text-xs"
                            />
                            <Pagination
                                currentPage={currentPage}
                                totalPages={totalPages}
                                onPageChange={goToPage}
                            />
                        </div>
                    </div>
                )}
            </div>

            {/* Detail Modal */}
            {selectedBooking && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4"
                    onClick={() => setSelectedBooking(null)}
                >
                    <div
                        className="bg-[#1a1d26] border border-gray-800 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl"
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between p-5 border-b border-gray-800 bg-linear-to-r from-red-600/10 to-transparent rounded-t-2xl">
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

                        <div className="p-5 space-y-5">
                            <div className="flex gap-4">
                                {selectedBooking.posterUri ? (
                                    <img src={selectedBooking.posterUri} alt={selectedBooking.title} className="w-20 h-32 object-cover rounded-lg bg-gray-900 shrink-0" />
                                ) : (
                                    <div className="w-20 h-32 bg-gray-800 rounded-lg flex items-center justify-center shrink-0">
                                        <Film size={28} className="text-gray-600" />
                                    </div>
                                )}
                                <div className="flex flex-col justify-between py-1">
                                    <div className="flex flex-row justify-between items-center px-1">
                                        <h3 className="text-white font-bold text-lg">{selectedBooking.title}</h3>
                                        {selectedBooking.ageRestriction && (
                                            <AgeRestrictionBadge
                                                restriction={selectedBooking.ageRestriction}
                                                className="w-fit block"
                                            />
                                        )}
                                    </div>
                                    <div className="space-y-1.5 text-sm">
                                        <div className="flex items-center gap-2 text-gray-400">
                                            <User size={14} className="text-red-600" />
                                            <span>Email: <span className="text-gray-200 font-mono">{selectedBooking.userEmail}</span></span>
                                        </div>
                                        <div className="flex items-center gap-2 text-gray-400">
                                            <Calendar size={14} className="text-red-600" />
                                            <span>Сеанс: <span className="text-gray-200">{formatDateWithYear(selectedBooking.startTime)} в {formatTime(selectedBooking.startTime)}</span></span>
                                        </div>
                                        <div className="flex items-center gap-2 text-gray-400">
                                            <Clock size={14} className="text-red-600" />
                                            <span>Час броні: <span className="text-gray-200">{formatDateWithYear(selectedBooking.bookingTime)} в {formatTime(selectedBooking.bookingTime)}</span></span>
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