import { useEffect, useState } from 'react';
import { BookingService } from '../services/booking.service';
import { BookingStatus, type BookingDto } from '../types/booking';
import { Ticket, CreditCard, Trash2, Calendar, Loader2 } from 'lucide-react';
import { Button } from '../components/ui/Button';

export const Checkout = () => {
    const [booking, setBooking] = useState<BookingDto | null>(null);
    const [loading, setLoading] = useState(true);
    const [isProcessing, setIsProcessing] = useState(false);

    const loadCurrentBooking = async () => {
        try {
            setLoading(true);
            const myBookings = await BookingService.getMyBookings();
            const active = myBookings.find(b => b.status === BookingStatus.Inprogress);
            setBooking(active || null);
        } catch (err) {
            console.error("Помилка завантаження кошика", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadCurrentBooking();
    }, []);

    const handlePayment = async () => {
        if (!booking) return;
        try {
            setIsProcessing(true);
            await BookingService.confirmBooking(booking.id);
            alert("Оплата успішна! Квитки надіслано на пошту.");
            setBooking(null);
        } catch (err) {
            console.error(err);
            alert("Помилка при оплаті");
        } finally {
            setIsProcessing(false);
        }
    };

    const handleCancel = async () => {
        if (!booking || !window.confirm("Ви впевнені, що хочете видалити ці квитки?")) return;
        try {
            await BookingService.cancelBooking(booking.id);
            setBooking(null);
        } catch (err) {
            console.error(err);
            alert("Помилка при оплаті");
        }
    };

    if (loading) return (
        <div className="min-h-screen bg-[#0f1117] flex items-center justify-center">
            <Loader2 className="animate-spin text-red-600" size={48} />
        </div>
    );

    if (!booking || booking.tickets.length === 0) return (
        <div className="min-h-screen bg-[#0f1117] text-white flex flex-col items-center justify-center p-6">
            <Ticket size={64} className="text-gray-700 mb-4" />
            <h2 className="text-2xl font-bold">Ваш кошик порожній</h2>
            <p className="text-gray-400 mt-2">Оберіть фільм та місце, щоб розпочати бронювання.</p>
            <Button className="mt-6" onClick={() => window.location.href = '/'}>До афіші</Button>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#0f1117] text-white p-6">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold mb-8 flex items-center gap-3">
                    <CreditCard className="text-red-600" /> Оформлення замовлення
                </h1>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Список квитків */}
                    <div className="lg:col-span-2 space-y-4">
                        <h2 className="text-xl font-semibold mb-4 text-gray-400 uppercase tracking-wider text-sm">Ваші квитки</h2>
                        {booking.tickets.map((ticket) => (
                            <div key={ticket.id} className="bg-[#1a1d26] border border-gray-800 p-4 rounded-2xl flex justify-between items-center group">
                                <div className="flex items-center gap-4">
                                    <div className="bg-red-600/10 p-3 rounded-xl">
                                        <Ticket className="text-red-600" size={24} />
                                    </div>
                                    <div>
                                        <p className="font-bold text-lg">Сеанс #{ticket.sessionId}</p>
                                        <p className="text-gray-500 text-sm">Місце: {ticket.seatId}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="font-bold text-xl">{ticket.actualPrice} ₴</p>
                                    <span className="text-[10px] text-green-500 bg-green-500/10 px-2 py-0.5 rounded uppercase font-bold">Доступно</span>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Підсумок (Чек) */}
                    <div className="bg-[#1a1d26] border border-gray-800 p-6 rounded-3xl h-fit sticky top-6">
                        <h2 className="text-xl font-bold mb-6">Разом до оплати</h2>

                        <div className="space-y-3 mb-6">
                            <div className="flex justify-between text-gray-400">
                                <span>Кількість квитків:</span>
                                <span className="text-white font-medium">{booking.tickets.length}</span>
                            </div>
                            <div className="flex justify-between text-gray-400">
                                <span>Дата бронювання:</span>
                                <span className="text-white font-medium flex items-center gap-1">
                                    <Calendar size={14} /> {new Date(booking.bookingTime).toLocaleDateString()}
                                </span>
                            </div>
                            <div className="border-t border-gray-800 pt-3 flex justify-between text-xl font-bold">
                                <span>Сума:</span>
                                <span className="text-red-600">{booking.totalPrice} ₴</span>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <Button
                                className="w-full py-4 text-lg"
                                onClick={handlePayment}
                                isLoading={isProcessing}
                            >
                                Підтвердити та оплатити
                            </Button>

                            <button
                                onClick={handleCancel}
                                className="w-full flex items-center justify-center gap-2 text-gray-500 hover:text-red-500 transition-colors text-sm font-medium py-2"
                            >
                                <Trash2 size={16} /> Скасувати бронювання
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};