import { useEffect, useState, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import {
    ArrowLeft,
    Calendar,
    Clock,
    MapPin,
    ChevronRight,
    X,
    Loader2,
    ShieldAlert,
} from 'lucide-react';
import type { SessionDto } from "../types/session.ts";
import { formatDateWithYear, formatTime } from "../utils/formatTime.ts";
import { getSeatTypeColor, getSeatTypeLabelColor } from "../utils/formatSeat.ts";
import { SessionService } from "../services/session.service";
import { SeatService } from "../services/seat.service";
import { BookingService } from "../services/booking.service";
import type {SessionSeatDto} from "../types/seat.ts";
import {ConfirmModal} from "../components/ui/ConfirmModal.tsx";
import {AgeRestrictionBadge} from "../components/AgeRestrictionBadge.tsx";

const SessionPage = () => {
    const { user } = useAuthStore();
    const { sessionId } = useParams<{ sessionId: string }>();
    const navigate = useNavigate();

    const [session, setSession] = useState<SessionDto | null>(null);
    const [seats, setSeats] = useState<SessionSeatDto[]>([]);
    const [selectedSeats, setSelectedSeats] = useState<SessionSeatDto[]>([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [purchasing, setPurchasing] = useState(false);
    const [purchaseError, setPurchaseError] = useState<string | null>(null);

    const [isConfirmOpen, setIsConfirmOpen] = useState(false);

    const fetchData = useCallback(async () => {
        if (!sessionId) return;
        try {
            const id = Number(sessionId);
            const [sessionData, seatsData] = await Promise.all([
                SessionService.getById(id),
                SeatService.getAvailableSeats(id)
            ]);
            setSession(sessionData);
            setSeats(seatsData);
        } catch (err) {
            console.error(err);
            setError('Не вдалося завантажити сеанс.');
        } finally {
            setLoading(false);
        }
    }, [sessionId]);

    useEffect(() => { fetchData(); }, [fetchData]);

    const toggleSeat = (seat: SessionSeatDto) => {
        // Забороняємо вибір місць для адміна
        if (user?.role === 'Admin') return;
        if (!seat.isAvailable) return;
        setSelectedSeats((prev) =>
            prev.find((s) => s.seatId === seat.seatId)
                ? prev.filter((s) => s.seatId !== seat.seatId)
                : [...prev, seat]
        );
    };

    const isSelected = (seat: SessionSeatDto) =>
        !!selectedSeats.find((s) => s.seatId === seat.seatId);

    const totalPrice = selectedSeats.reduce((sum, s) => sum + s.price, 0);

    const startPurchaseProcess = () => {
        if (!session || selectedSeats.length === 0) return;

        if (session.ageRestriction.toString() === "SixteenPlus" || session.ageRestriction.toString() === "EighteenPlus") {
            setIsConfirmOpen(true);
        } else {
            handlePurchase();
        }
    };

    const handlePurchase = async () => {
        if (!session || selectedSeats.length === 0) return;
        setPurchasing(true);
        setPurchaseError(null);

        try {
            const created = await BookingService.createBooking({
                sessionId: session.id,
                seatIds: selectedSeats.map((s) => s.seatId),
            });

            navigate(`/bookings/${created.id}`);
        } catch (err: any) {
            setPurchaseError(
                err?.response?.data?.message || 'Помилка при оформленні бронювання.'
            );
        } finally {
            setPurchasing(false);
        }
    };

    const rows = (() => {
        const map = new Map<number, SessionSeatDto[]>();
        seats.forEach((seat) => {
            const arr = map.get(seat.rowNumber) ?? [];
            arr.push(seat);
            map.set(seat.rowNumber, arr);
        });
        return Array.from(map.entries())
            .sort(([a], [b]) => a - b)
            .map(([row, rowSeats]) => ({
                row,
                seats: rowSeats.sort((a, b) => a.seatNumber - b.seatNumber),
            }));
    })();

    const seatTypes = [...new Set(seats.map((s) => s.type))];

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0f1117] flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-gray-400 text-lg">Завантаження сеансу...</p>
                </div>
            </div>
        );
    }

    if (error || !session) {
        return (
            <div className="min-h-screen bg-[#0f1117] flex items-center justify-center">
                <div className="text-center">
                    <p className="text-red-500 text-xl mb-4">{error || 'Сеанс не знайдений'}</p>
                    <Link to="/" className="text-red-600 hover:underline flex items-center justify-center gap-2">
                        <ArrowLeft size={20} /> Назад до фільмів
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0f1117] text-white font-sans">
            <div className="max-w-7xl mx-auto px-4 py-8">
                {/* ── Back ──────────────────────────────────── */}
                <Link to="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-red-600 mb-6 transition-colors group">
                    <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                    Назад до фільмів
                </Link>

                {/* ── Session Header ─────────────────────────── */}
                <div className="bg-[#1a1d26] rounded-2xl border border-gray-800 p-6 mb-8">
                    <h1 className="text-3xl font-black mb-4">{session.movieTitle}</h1>
                    <div className="flex flex-wrap gap-5 text-sm text-gray-400">
                        <div className="flex items-center gap-2">
                            <Calendar size={16} className="text-red-600" />
                            <span>{formatDateWithYear(session.startTime)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Clock size={16} className="text-red-600" />
                            <span>{formatTime(session.startTime)} – {formatTime(session.endTime)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <MapPin size={16} className="text-red-600" />
                            <span>{session.hallName}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-red-600 text-xs font-bold bg-red-600/15 border border-red-600/30 px-2 py-0.5 rounded">
                                {session.languageName}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col xl:flex-row gap-8">
                    {/* ── Hall Scheme ────────────────────────── */}
                    <div className="flex-1 bg-[#1a1d26] rounded-2xl border border-gray-800 p-6 overflow-x-auto">
                        <div className="mb-8 flex flex-col items-center">
                            <div className="w-3/4 max-w-md h-1.5 bg-gradient-to-r from-transparent via-white/50 to-transparent rounded-full shadow-lg shadow-white/20" />
                            <span className="text-gray-600 text-xs mt-2 tracking-widest uppercase">Екран</span>
                        </div>

                        <div className="flex justify-center flex-wrap gap-4 mb-6">
                            {seatTypes.map((type) => (
                                <div key={type} className="flex items-center gap-2">
                                    <div className={`w-5 h-5 rounded-md border ${getSeatTypeLabelColor(type)}`} />
                                    <span className="text-gray-400 text-xs capitalize">{type}</span>
                                </div>
                            ))}
                            <div className="flex items-center gap-2">
                                <div className="w-5 h-5 rounded-md bg-red-600 border border-red-500" />
                                <span className="text-gray-400 text-xs">Обране</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-5 h-5 rounded-md bg-gray-800 border border-gray-800" />
                                <span className="text-gray-500 text-xs">Зайнято</span>
                            </div>
                        </div>

                        <div className="flex flex-col items-center gap-1.5">
                            {rows.map(({ row, seats: rowSeats }) => (
                                <div key={row} className="flex items-center gap-2">
                                    <span className="text-gray-600 text-xs w-5 text-right flex-shrink-0">{row}</span>
                                    <div className="flex gap-1.5">
                                        {rowSeats.map((seat) => (
                                            <button
                                                key={seat.seatId}
                                                onClick={() => toggleSeat(seat)}
                                                disabled={!seat.isAvailable || user?.role === 'Admin'}
                                                className={[
                                                    'w-8 h-8 rounded-md text-xs font-bold transition-all duration-150 border',
                                                    getSeatTypeColor(seat.type, seat.isAvailable, isSelected(seat)),
                                                    user?.role === 'Admin' ? 'cursor-default' : ''
                                                ].join(' ')}
                                            >
                                                {seat.seatNumber}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* ── Checkout Panel ─────────────────────── */}
                    <div className="xl:w-96 flex-shrink-0">
                        {user?.role === 'Admin' ? (
                            // Показуємо плашку для адміна
                            <div className="bg-amber-500/5 border border-amber-500/20 rounded-2xl p-8 text-center sticky top-24">
                                <div className="w-16 h-16 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <ShieldAlert className="text-amber-500" size={32} />
                                </div>
                                <h2 className="text-amber-500 font-bold text-lg mb-2">Режим перегляду</h2>
                                <p className="text-gray-400 text-sm leading-relaxed">
                                    Як адміністратор, ви бачите схему залу та зайняті місця, але не можете здійснювати бронювання.
                                </p>
                            </div>
                        ) : (
                            // Показуємо панель бронювання для всіх інших (Юзерів та гостей)
                            <div className="bg-[#1a1d26] rounded-2xl border border-gray-800 p-6 sticky top-24">
                                <h2 className="text-xl font-bold mb-4">Обрані місця</h2>

                                {selectedSeats.length === 0 ? (
                                    <div className="text-center py-10">
                                        <div className="w-12 h-12 rounded-full bg-gray-800 flex items-center justify-center mx-auto mb-3">
                                            <MapPin size={22} className="text-gray-600" />
                                        </div>
                                        <p className="text-gray-500 text-sm">Виберіть місця на схемі залу</p>
                                    </div>
                                ) : (
                                    <>
                                        <div className="space-y-2 mb-5 max-h-60 overflow-y-auto pr-1">
                                            {selectedSeats.map((seat) => (
                                                <div key={seat.seatId} className="flex items-center justify-between bg-gray-800/60 rounded-lg px-4 py-2.5 border border-gray-700">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-7 h-7 rounded bg-red-600 flex items-center justify-center text-xs font-bold">{seat.seatNumber}</div>
                                                        <div>
                                                            <span className="text-gray-300 text-sm">Ряд <span className="text-white font-semibold">{seat.rowNumber}</span>, Місце <span className="text-white font-semibold">{seat.seatNumber}</span></span>
                                                            <span className={`block text-xs capitalize mt-0.5 ${seat.type.toString().toLowerCase() === 'vip' ? 'text-yellow-500' : 'text-gray-500'}`}>{seat.type}</span>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        <span className="text-red-500 font-bold">{seat.price}₴</span>
                                                        <button onClick={() => toggleSeat(seat)} className="text-gray-600 hover:text-red-500 transition-colors"><X size={16} /></button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        <div className="border-t border-gray-700 pt-4 mb-5">
                                            <div className="flex items-center justify-between">
                                                <span className="text-gray-400">Всього ({selectedSeats.length} {selectedSeats.length === 1 ? 'квиток' : 'квитки'})</span>
                                                <span className="text-3xl font-black text-red-600">{totalPrice}₴</span>
                                            </div>
                                        </div>

                                        {purchaseError && (
                                            <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3 mb-4">
                                                <p className="text-red-400 text-sm">{purchaseError}</p>
                                            </div>
                                        )}

                                        <button
                                            onClick={startPurchaseProcess}
                                            disabled={purchasing || !user}
                                            className={[
                                                'w-full py-3.5 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all',
                                                purchasing || !user
                                                    ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                                                    : 'bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-600/30 hover:shadow-red-600/50',
                                            ].join(' ')}
                                        >
                                            {purchasing ? (
                                                <><Loader2 size={20} className="animate-spin" /> Оформлення...</>
                                            ) : !user ? (
                                                'Авторизуйтесь для покупки'
                                            ) : (
                                                <>Купити квитки <ChevronRight size={20} /></>
                                            )}
                                        </button>
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Модалка підтвердження віку */}
            <ConfirmModal
                isOpen={isConfirmOpen}
                title="Вікове обмеження"
                variant="warning"
                confirmText="Продовжити"
                cancelText="Назад"
                description={
                    <div className="space-y-3">
                        <p>Цей фільм має вікове обмеження:</p>
                        {session && (
                            <AgeRestrictionBadge restriction={session.ageRestriction} className="px-3 py-1" />
                        )}
                        <p className="text-xs text-gray-500">
                            Купуючи квиток, ви підтверджуєте, що відповідаєте віковим вимогам.
                        </p>
                    </div>
                }
                onConfirm={() => {
                    setIsConfirmOpen(false);
                    handlePurchase();
                }}
                onClose={() => setIsConfirmOpen(false)}
                isLoading={purchasing}
            />
        </div>
    );
};

export default SessionPage;