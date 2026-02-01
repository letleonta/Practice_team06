import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axiosInstance';
import { ArrowLeft, Calendar, Clock, Film, Ticket as TicketIcon } from 'lucide-react';
import type {BookingDto} from "../types/booking.ts";
import {getStatusColor, getStatusText} from "../utils/bookingStatus.ts";
import {getAgeRestrictionText} from "../utils/ageRestriction.ts";

const BookingDetailsPage = () => {
    const { bookingId } = useParams<{ bookingId: string }>();
    const [booking, setBooking] = useState<BookingDto | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchBooking = async () => {
            if (!bookingId) return;
            try {
                const response = await api.get<BookingDto>(`/bookings/${bookingId}`);
                setBooking(response.data);
            } catch (err: any) {
                console.error("Error fetching booking:", err);
                setError("Не вдалося завантажити бронювання.");
            } finally {
                setLoading(false);
            }
        };

        fetchBooking();
    }, [bookingId]);

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0f1117] flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-400 text-lg">Завантаження...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-[#0f1117] flex items-center justify-center">
                <div className="text-center">
                    <p className="text-red-500 text-xl mb-4">{error}</p>
                    <Link to="/bookings/my" className="text-red-600 hover:underline flex items-center justify-center gap-2">
                        <ArrowLeft size={20} /> Повернутися до бронювань
                    </Link>
                </div>
            </div>
        );
    }

    if (!booking) {
        return (
            <div className="min-h-screen bg-[#0f1117] flex items-center justify-center">
                <div className="text-center">
                    <p className="text-gray-400 text-xl mb-4">Бронювання не знайдено</p>
                    <Link to="/bookings/my" className="text-red-600 hover:underline flex items-center justify-center gap-2">
                        <ArrowLeft size={20} /> Повернутися до бронювань
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0f1117] text-white font-sans">
            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 py-8">
                {/* Back Button */}
                <Link
                    to="/bookings/my"
                    className="inline-flex items-center gap-2 text-gray-400 hover:text-red-600 mb-6 transition-colors group"
                >
                    <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                    Назад до бронювань
                </Link>

                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-4xl font-black text-white">
                        Бронювання <span className="text-red-600">#{booking.id}</span>
                    </h1>
                    <div className={`px-4 py-2 rounded-full border font-semibold ${getStatusColor(booking.status)}`}>
                        {getStatusText(booking.status)}
                    </div>
                </div>

                {/* Two Column Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column - Movie Info */}
                    <div className="lg:col-span-1">
                        <div className="bg-[#1a1d26] rounded-2xl overflow-hidden border border-gray-800 shadow-2xl sticky top-24">
                            {/* Poster */}
                            <div className="relative aspect-[2/3] bg-gray-900">
                                {booking.posterUri ? (
                                    <img
                                        src={booking.posterUri}
                                        alt={booking.title}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                        <Film size={64} className="text-gray-700" />
                                    </div>
                                )}
                                {/* Age Restriction Badge */}
                                {booking.ageRestriction && (
                                    <div className="absolute top-4 right-4 bg-red-600 text-white font-bold px-3 py-1 rounded-lg text-sm shadow-lg">
                                        {getAgeRestrictionText(booking.ageRestriction)}
                                    </div>
                                )}
                            </div>

                            {/* Movie Details */}
                            <div className="p-6 space-y-4">
                                <h2 className="text-2xl font-bold text-white">{booking.title}</h2>

                                <div className="space-y-3 text-sm">
                                    <div className="flex items-center gap-3 text-gray-300">
                                        <Calendar size={18} className="text-red-600" />
                                        <div>
                                            <p className="text-gray-500 text-xs">Дата сеансу</p>
                                            <p className="font-semibold">
                                                {new Date(booking.startTime).toLocaleDateString('uk-UA', {
                                                    day: 'numeric',
                                                    month: 'long',
                                                    year: 'numeric'
                                                })}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3 text-gray-300">
                                        <Clock size={18} className="text-red-600" />
                                        <div>
                                            <p className="text-gray-500 text-xs">Час початку</p>
                                            <p className="font-semibold">
                                                {new Date(booking.startTime).toLocaleTimeString('uk-UA', {
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3 text-gray-300">
                                        <TicketIcon size={18} className="text-red-600" />
                                        <div>
                                            <p className="text-gray-500 text-xs">Дата бронювання</p>
                                            <p className="font-semibold">
                                                {new Date(booking.bookingTime).toLocaleDateString('uk-UA', {
                                                    day: 'numeric',
                                                    month: 'long',
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Total Price */}
                                <div className="pt-4 border-t border-gray-700">
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-400 text-sm">Загальна ціна</span>
                                        <span className="text-3xl font-black text-red-600">
                                            {booking.totalPrice}₴
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Tickets */}
                    <div className="lg:col-span-2">
                        <div className="bg-[#1a1d26] rounded-2xl border border-gray-800 shadow-2xl overflow-hidden">
                            {/* Header */}
                            <div className="p-6 border-b border-gray-800 bg-gradient-to-r from-red-600/10 to-transparent">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-2xl font-bold flex items-center gap-3">
                                        <TicketIcon size={28} className="text-red-600" />
                                        Квитки
                                    </h2>
                                    <span className="bg-red-600/20 text-red-400 px-4 py-1 rounded-full text-sm font-semibold border border-red-600/30">
                                        {booking.tickets.length} {booking.tickets.length === 1 ? 'квиток' : 'квитки'}
                                    </span>
                                </div>
                            </div>

                            {/* Tickets List */}
                            <div className="p-6">
                                {booking.tickets.length === 0 ? (
                                    <div className="text-center py-12">
                                        <TicketIcon size={64} className="text-gray-700 mx-auto mb-4" />
                                        <p className="text-gray-500 text-lg">Квитки відсутні</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {booking.tickets.map((ticket, index) => (
                                            <div
                                                key={`${ticket.id}-${index}`}
                                                className="relative bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-xl border border-gray-700 p-5 hover:border-red-600/50 transition-all hover:shadow-lg hover:shadow-red-600/10 group"
                                            >
                                                {/* Ticket Number Badge */}
                                                <div className="absolute -top-2 -right-2 bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                                                    #{index + 1}
                                                </div>

                                                {/* Ticket Info */}
                                                <div className="space-y-3 mt-2">
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-gray-500 text-sm">Ряд</span>
                                                        <span className="text-white font-bold text-xl">
                                                            {ticket.rowNumber || 'N/A'}
                                                        </span>
                                                    </div>

                                                    <div className="flex items-center justify-between">
                                                        <span className="text-gray-500 text-sm">Місце</span>
                                                        <span className="text-white font-bold text-xl">
                                                            {ticket.seatNumber || 'N/A'}
                                                        </span>
                                                    </div>

                                                    <div className="pt-3 border-t border-gray-700 flex items-center justify-between">
                                                        <span className="text-gray-500 text-sm">Ціна</span>
                                                        <span className="text-red-500 font-black text-2xl">
                                                            {ticket.actualPrice}₴
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* Decorative element */}
                                                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-red-600/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BookingDetailsPage;