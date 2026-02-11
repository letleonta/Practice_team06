import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Ticket, Calendar, Clock, Film, ChevronRight } from 'lucide-react';
import { type BookingFilterDto, BookingStatus } from "../types/booking";
import BookingFilterBar, { type FilterStatus } from "../components/BookingComponents/BookingFilterBar.tsx";
import { getStatusColor, getStatusText } from "../utils/formatBookingStatus";
import { formatDateWithYear, formatTime } from "../utils/formatTime";
import { BookingService } from "../services/booking.service";
import { AgeRestrictionBadge } from "../components/ui/AgeRestrictionBadge.tsx";
import { Pagination } from "../components/ui/Pagination.tsx";
import { UsePagination } from "../hooks/UsePagination";

const MyBookingsPage = () => {
    const [activeFilter, setactiveFilter] = useState<FilterStatus>('ALL');

    const fetchBookings = async (Page: number, PageSize: number) => {
        const filter: BookingFilterDto = {
            Page,
            PageSize
        };

        if (activeFilter !== 'ALL') {
            if (activeFilter === 'PAST') {
                filter.SessionToDate = new Date().toISOString();
            } else if (activeFilter === 'ACTIVE') {
                filter.SessionFromDate = new Date().toISOString();
                filter.Status = BookingStatus.Paid;
            } else if (activeFilter === 'CANCELLED') {
                filter.Status = BookingStatus.Cancelled;
            }
        }

        return await BookingService.getMyBookings(filter);
    };

    const {
        items: bookings,
        totalCount,
        currentPage,
        totalPages,
        loading,
        error,
        goToPage
    } = UsePagination(fetchBookings, [activeFilter], { pageSize: 6 });

    return (
        <div className="min-h-screen bg-[#0f1117] text-white font-sans pt-20">
            <main className="max-w-7xl mx-auto p-6 md:p-10">
                <header className="mb-12">
                    <h2 className="text-5xl font-black text-white mb-8 tracking-tighter uppercase">Ваші бронювання</h2>
                    <p className="text-gray-500 font-medium">
                        Перегляньте всі ваші квитки та майбутні сеанси
                        {totalCount > 0 && (
                            <span className="ml-2 text-red-600 font-medium">
                                ({totalCount})
                            </span>
                        )}
                    </p>
                </header>

                <BookingFilterBar
                    activeFilter={activeFilter}
                    onFilterChange={setactiveFilter}
                />

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-32 gap-4">
                        <div className="relative">
                            <div className="h-16 w-16 rounded-full border-4 border-gray-800"></div>
                            <div className="absolute top-0 h-16 w-16 rounded-full border-4 border-t-red-600 animate-spin"></div>
                        </div>
                        <p className="text-gray-500 font-medium animate-pulse">Завантаження бронювань...</p>
                    </div>
                ) : error ? (
                    <div className="text-center py-32">
                        <p className="text-red-500 text-xl mb-4">{error}</p>
                        <button
                            onClick={() => window.location.reload()}
                            className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl font-semibold transition-all"
                        >
                            Спробувати знову
                        </button>
                    </div>
                ) : bookings.length === 0 ? (
                    <div className="text-center py-32 bg-gray-800/20 rounded-[40px] border-2 border-dashed border-gray-800/50">
                        <div className="bg-gray-800 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Ticket size={32} className="text-gray-600" />
                        </div>
                        <p className="text-gray-500 text-center py-6 text-lg">
                            Немає бронювань {activeFilter !== 'ALL' ? `зі статусом "${activeFilter}"` : ''}
                        </p>
                        <Link
                            to="/movies"
                            className="inline-block bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-xl font-bold transition-all shadow-lg shadow-red-600/30"
                        >
                            Переглянути фільми
                        </Link>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {bookings.map((booking) => (
                                <Link
                                    key={booking.id}
                                    to={`/bookings/${booking.id}`}
                                    className="group block bg-[#1a1d26] rounded-2xl border border-gray-800 overflow-hidden hover:border-red-600/50 transition-all hover:shadow-2xl hover:shadow-red-600/10 hover:-translate-y-1"
                                >
                                    <div className="relative aspect-video bg-gray-900 overflow-hidden">
                                        {booking.posterUri ? (
                                            <img
                                                src={booking.posterUri}
                                                alt={booking.title}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <Film size={48} className="text-gray-700" />
                                            </div>
                                        )}

                                        <div className="absolute inset-0 bg-linear-to-t from-[#1a1d26] via-transparent to-transparent"></div>

                                        <AgeRestrictionBadge
                                            restriction={booking.ageRestriction}
                                            className="absolute bottom-3 left-3"
                                        />

                                        <div className={`absolute bottom-3 right-3 px-3 py-1 rounded-full text-xs font-semibold border backdrop-blur-sm ${getStatusColor(booking.status)}`}>
                                            {getStatusText(booking.status)}
                                        </div>
                                    </div>

                                    <div className="p-5 bg-[#1a1d26] relative z-20 -mt-px">
                                        <h3 className="font-bold text-xl mb-3 text-white group-hover:text-red-600 transition-colors line-clamp-1">
                                            {booking.title}
                                        </h3>

                                        <div className="space-y-2.5 mb-4">
                                            <div className="flex items-center gap-2 text-sm">
                                                <Calendar size={16} className="text-red-600 shrink-0" />
                                                <span className="text-gray-400">
                                                    {formatDateWithYear(booking.startTime)}
                                                </span>
                                            </div>

                                            <div className="flex items-center gap-2 text-sm">
                                                <Clock size={16} className="text-red-600 shrink-0" />
                                                <span className="text-gray-400">
                                                    {formatTime(booking.startTime)}
                                                </span>
                                            </div>

                                            <div className="flex items-center gap-2 text-sm">
                                                <Ticket size={16} className="text-red-600 shrink-0" />
                                                <span className="text-gray-400">
                                                    {booking.ticketsCount} квит.
                                                </span>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between pt-4 border-t border-gray-800">
                                            <div>
                                                <p className="text-xs text-gray-500 mb-1">Загальна ціна</p>
                                                <p className="text-2xl font-black text-red-600">
                                                    {booking.totalPrice}₴
                                                </p>
                                            </div>
                                            <div className="bg-red-600/10 p-2 rounded-full group-hover:bg-red-600 transition-colors">
                                                <ChevronRight size={20} className="text-red-600 group-hover:text-white transition-colors" />
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>

                        {/* Pagination */}
                        <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={goToPage}
                            className="mt-12"
                        />
                    </>
                )}
            </main>
        </div>
    );
};

export default MyBookingsPage;