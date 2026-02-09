import {useCallback, useEffect, useState} from 'react';
import {
    Search, Filter, X, Eye,
    Calendar, Clock, User, Film, Ticket as TicketIcon,
    TrendingUp, ChevronDown, Ticket, Trash2, RotateCcw
} from 'lucide-react';
import { getStatusColor, getStatusText } from '../../utils/formatBookingStatus';
import {type AdminBookingDetailsDto, type BookingsStatsDto, BookingStatus} from "../../types/booking.ts";
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
import {StatCard} from "../../components/ui/StatCard.tsx";
import {AdminModal} from "../../components/AdminModal.tsx";
import {notify} from "../../utils/toast.ts";
import {ConfirmModal} from "../../components/ui/ConfirmModal.tsx";

type StatusFilter = BookingStatus | 'ALL';
type SortBy = 'date' | 'status' | 'userEmail';

const AdminBookingsPage = () => {
    const [stats, setStats] = useState<BookingsStatsDto | null>(null);
    const [statsLoading, setStatsLoading] = useState(false);
    const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');
    const [sessionFrom, setSessionFrom] = useState('');
    const [sessionTo, setSessionTo] = useState('');
    const [bookingFrom, setBookingFrom] = useState('');
    const [bookingTo, setBookingTo] = useState('');
    const [userEmail, setUserEmail] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [ticketPage, setTicketPage] = useState(1);
    const TICKET_PAGE_SIZE = 6;

    const [sortBy, setSortBy] = useState<SortBy>('date');
    const [isDesc, setIsDesc] = useState(true);

    const [filtersOpen, setFiltersOpen] = useState(false);
    const [selectedBooking, setSelectedBooking] = useState<AdminBookingDto | AdminBookingDetailsDto | null>(null);
    const [detailsLoading, setDetailsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [confirmCancel, setConfirmCancel] = useState<{isOpen: boolean; id: number | null}>({ isOpen: false, id: null });
    const [confirmDelete, setConfirmDelete] = useState<{isOpen: boolean; id: number | null}>({ isOpen: false, id: null });

    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const handleRefresh = () => setRefreshTrigger(prev => prev + 1);

    const handleCancelClick = (id: number) => setConfirmCancel({ isOpen: true, id });
    const handleDeleteClick = (id: number) => setConfirmDelete({ isOpen: true, id });

    // Fetch function for pagination hook
    const fetchBookings = useCallback(async (Page: number, PageSize: number) => {
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

        return await BookingService.getAllBookings(filter);
    }, [statusFilter, sessionFrom, sessionTo, bookingFrom, bookingTo, userEmail, searchQuery, sortBy, isDesc]);

    const loadStats = async () => {
        setStatsLoading(true);
        try {
            const filter: BookingFilterDto = {
                Status: statusFilter !== 'ALL' ? statusFilter : undefined,
                SessionFromDate: sessionFrom || undefined,
                SessionToDate: sessionTo || undefined,
                BookingFromDate: bookingFrom || undefined,
                BookingToDate: bookingTo || undefined,
                UserEmail: userEmail || undefined,
                SearchQuery: searchQuery || undefined,
            };
            const data = await BookingService.getStats(filter);
            setStats(data);
        } finally {
            setStatsLoading(false);
        }
    };

    useEffect(() => {
        loadStats();
    }, [statusFilter, sessionFrom, sessionTo, bookingFrom, bookingTo, userEmail, searchQuery]);

    useEffect(() => {
        const fetchDetails = async () => {
            if (!selectedBooking?.id) return;
            setDetailsLoading(true);
            try {
                const data = await BookingService.getBookingById(selectedBooking.id, {
                    Page: ticketPage,
                    PageSize: TICKET_PAGE_SIZE
                });
                setSelectedBooking(data as AdminBookingDetailsDto);
            } catch (err) {
                console.error("Error loading tickets:", err);
            } finally {
                setDetailsLoading(false);
            }
        };
        fetchDetails();
    }, [selectedBooking?.id, ticketPage]);

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
        [
            statusFilter, sessionFrom, sessionTo, bookingFrom,
            bookingTo, userEmail, searchQuery, sortBy, isDesc,
            refreshTrigger
        ],
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

    const onConfirmCancel = async () => {
        if (!confirmCancel.id) return;
        setIsSaving(true);
        try {
            await BookingService.cancelBooking(confirmCancel.id);
            notify.success("Бронювання успішно скасовано");

            loadStats();
            handleRefresh();
            setSelectedBooking(null);
        } catch (err) {
            console.error("Cancel error:", err);
        } finally {
            setIsSaving(false);
            setConfirmCancel({ isOpen: false, id: null });
        }
    };

    const onConfirmDelete = async () => {
        if (!confirmDelete.id) return;
        setIsSaving(true);
        try {
            await BookingService.deleteBooking(confirmDelete.id);
            notify.success("Запис видалено");

            loadStats();
            handleRefresh();
            setSelectedBooking(null);
        } catch (err) {
            console.error("Delete error:", err);
        } finally {
            setIsSaving(false);
            setConfirmDelete({ isOpen: false, id: null });
        }
    };

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
                <div className="relative min-h-75 w-full">
                    {statsLoading && (
                        <div className="absolute inset-0 z-20 bg-[#161820]/60 backdrop-blur-sm flex items-center justify-center rounded-3xl transition-all">
                            <div className="flex flex-col items-center gap-3">
                                <div className="w-10 h-10 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                                <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Оновлення статистики...</p>
                            </div>
                        </div>
                    )}

                    {stats && bookings.length > 0 ? (
                        <div className={`flex flex-col gap-6 transition-all duration-300 ${statsLoading ? 'opacity-30 blur-[2px]' : 'opacity-100'}`}>
                            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                                <div className="lg:col-span-3 min-w-0">
                                    <RevenueChart data={stats.revenuePoints} />
                                </div>

                                <div className="flex flex-col gap-6">
                                    <StatCard
                                        label="Загальна вартість проданих квитків"
                                        value={`${stats.totalRevenue?.toLocaleString()} ₴`}
                                        icon={<TrendingUp size={28} />}
                                        iconColorClass="text-emerald-500"
                                        bgColorClass="bg-emerald-500/10"
                                    />

                                    <StatCard
                                        label="Загальна кількість проданих квитків"
                                        value={stats.totalTicketsCount}
                                        icon={<Ticket size={28} />}
                                        iconColorClass="text-blue-500"
                                        bgColorClass="bg-blue-500/10"
                                    />
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
                    ) : (
                        !statsLoading && <div className="flex flex-col items-center justify-center min-h-100 w-full py-10">
                            <TrendingUp size={48} className="text-gray-800 mb-4" strokeWidth={1} />

                            <div className="space-y-1">
                                <p className="text-gray-400 font-medium tracking-tight">
                                    Статистика відсутня
                                </p>
                                <p className="text-gray-600 text-sm">
                                    За обраний період даних не знайдено
                                </p>
                            </div>
                        </div>
                    )}
                </div>

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

            <AdminModal
                isOpen={!!selectedBooking}
                onClose={() => { setSelectedBooking(null); setTicketPage(1); }}
                maxWidth="max-w-xl"
                title={
                    <h2 className="text-xl font-black tracking-tighter">
                        Бронювання <span className="text-red-600">#{selectedBooking?.id}</span>
                    </h2>
                }
                headerExtra={selectedBooking && (
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold border tracking-widest ${getStatusColor(selectedBooking.status)}`}>
            {getStatusText(selectedBooking.status)}
        </span>
                )}
                footer={selectedBooking && (
                    <>
                        {selectedBooking.status !== 'Cancelled' && (
                            <button
                                onClick={() => handleCancelClick(selectedBooking.id)}
                                className="flex-1 flex items-center justify-center gap-2 py-4 bg-gray-800 hover:bg-orange-600/20 text-white hover:text-orange-500 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all border border-transparent hover:border-orange-600/30"
                            >
                                <RotateCcw size={16} /> Скасувати бронювання
                            </button>
                        )}

                        <button
                            onClick={() => handleDeleteClick(selectedBooking.id)}
                            className="flex-1 flex items-center justify-center gap-2 py-4 bg-red-600/10 hover:bg-red-600 text-red-600 hover:text-white rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all border border-red-600/20"
                        >
                            <Trash2 size={16} /> Видалити запис
                        </button>
                    </>
                )}
            >
                {detailsLoading && !('pagedTickets' in selectedBooking!) ? (
                    <div className="py-20 flex justify-center">
                        <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : selectedBooking && (
                    <div className="space-y-6">
                        <div className="flex gap-6">
                            {selectedBooking.posterUri ? (
                                <img src={selectedBooking.posterUri} alt={selectedBooking.title}
                                     className="w-24 h-36 object-cover rounded-2xl shadow-lg bg-gray-900 shrink-0 border border-gray-800"/>
                            ) : (
                                <div className="w-24 h-36 bg-gray-800 rounded-2xl flex items-center justify-center shrink-0 border border-gray-700">
                                    <Film size={32} className="text-gray-600"/>
                                </div>
                            )}
                            <div className="flex flex-col justify-center gap-3">
                                <div>
                                    <h3 className="text-xl font-black uppercase leading-tight text-white mb-2">{selectedBooking.title}</h3>
                                    {selectedBooking.ageRestriction && (
                                        <AgeRestrictionBadge restriction={selectedBooking.ageRestriction} className="w-fit" />
                                    )}
                                </div>
                                <div className="space-y-1.5 text-sm">
                                    <div className="flex items-center gap-2 text-gray-400">
                                        <User size={14} className="text-red-600"/>
                                        <span>Email: <span className="text-gray-200 font-mono">{selectedBooking.userEmail}</span></span>
                                    </div>
                                    <div className="flex items-center gap-2 text-gray-400">
                                        <Calendar size={14} className="text-red-600"/>
                                        <span>Сеанс: <span className="text-gray-200">{formatDateWithYear(selectedBooking.startTime)} в {formatTime(selectedBooking.startTime)}</span></span>
                                    </div>
                                    <div className="flex items-center gap-2 text-gray-400">
                                        <Clock size={14} className="text-red-600"/>
                                        <span>Час бронювання: <span className="text-gray-200">{formatDateWithYear(selectedBooking.bookingTime)} о {formatTime(selectedBooking.bookingTime)}</span></span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Список квитків */}
                        <div className="pt-2">
                            <div className="flex items-center justify-between mb-3">
                                <h4 className="text-sm font-semibold text-gray-300 flex items-center gap-2">
                                    <TicketIcon size={14} className="text-red-600"/> Квитки ({selectedBooking.ticketsCount} шт.)
                                </h4>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {'pagedTickets' in selectedBooking ? (
                                    <>
                                        {selectedBooking.pagedTickets.items.map((t, i) => (
                                            <div key={i} className="bg-gray-900/50 border border-gray-800 rounded-2xl p-4 flex items-center justify-between group hover:border-red-600/30 transition-colors">
                                                <div>
                                                    <p className="text-[10px] text-gray-500 uppercase font-black tracking-tight">Ряд {t.rowNumber} · Місце {t.seatNumber}</p>
                                                    <p className="text-white font-bold text-sm mt-1 opacity-80">
                                                        Квиток #{(ticketPage - 1) * TICKET_PAGE_SIZE + i + 1}
                                                    </p>
                                                </div>
                                                <span className="text-red-600 font-black text-lg">{t.actualPrice}₴</span>
                                            </div>
                                        ))}
                                        {selectedBooking.pagedTickets.totalCount > TICKET_PAGE_SIZE && (
                                            <div className="col-span-full flex justify-center pt-4">
                                                <Pagination
                                                    currentPage={ticketPage}
                                                    totalPages={Math.ceil(selectedBooking.pagedTickets.totalCount / TICKET_PAGE_SIZE)}
                                                    onPageChange={(p) => setTicketPage(p)}
                                                />
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <div className="col-span-full py-10 text-center border-2 border-dashed border-gray-800 rounded-3xl text-gray-600 text-[10px] font-black uppercase tracking-widest">
                                        Завантаження квитків...
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="flex items-center justify-between pt-6 border-t border-gray-800">
                            <span className="text-gray-500 font-black uppercase text-sm tracking-widest">Загальна вартість</span>
                            <span className="text-3xl font-black text-red-600 leading-none">{selectedBooking.totalPrice}₴</span>
                        </div>
                    </div>
                )}
            </AdminModal>

            <ConfirmModal
                isOpen={confirmCancel.isOpen}
                variant="warning"
                title="Скасувати бронювання?"
                description="Квитки будуть анульовані та повернуться у вільний продаж. Цю дію можна змінити лише через базу даних."
                confirmText="Так, скасувати"
                cancelText="Ні"
                onConfirm={onConfirmCancel}
                onClose={() => setConfirmCancel({ isOpen: false, id: null })}
                isLoading={isSaving}
            />

            <ConfirmModal
                isOpen={confirmDelete.isOpen}
                variant="danger"
                title="Остаточне видалення"
                description="Ви впевнені, що хочете видалити цей запис? Це повністю видалить інформацію про покупку з історії системи."
                confirmText="Видалити назавжди"
                onConfirm={onConfirmDelete}
                onClose={() => setConfirmDelete({ isOpen: false, id: null })}
                isLoading={isSaving}
            />

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