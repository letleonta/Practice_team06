import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { seatService } from '../services/seatService.ts';
import type { SessionSeatDto } from '../types/seat.ts';

export function BookingPage() {
    const { sessionId } = useParams<{ sessionId: string }>();
    const navigate = useNavigate();

    const [seats, setSeats] = useState<SessionSeatDto[]>([]);
    const [selectedSeats, setSelectedSeats] = useState<SessionSeatDto[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (sessionId) {
            seatService.getAvailableSeats(Number(sessionId))
                .then(data => {
                    setSeats(data);
                    setLoading(false);
                })
                .catch(() => setLoading(false));
        }
    }, [sessionId]);

    const toggleSeat = (seat: SessionSeatDto) => {
        if (!seat.isAvailable) return; // Зайняті місця не клікаються

        setSelectedSeats(prev =>
            prev.find(s => s.seatId === seat.seatId)
                ? prev.filter(s => s.seatId !== seat.seatId) // Прибрати виділення
                : [...prev, seat] // Додати у виділені
        );
    };

    const totalPrice = selectedSeats.reduce((sum, s) => sum + (s.price || 0), 0);

    if (loading) return <div className="container"><h2>Завантаження схеми залу...</h2></div>;

    // Групуємо місця по RowNumber
    const rows = Array.from(new Set(seats.map(s => s.rowNumber))).sort((a, b) => a - b);

    return (
        <div className="container booking-page">
            <button onClick={() => navigate(-1)} className="back-btn">← Назад до фільму</button>

            <div className="screen-area">
                <div className="screen-curve"></div>
                <p>ЕКРАН</p>
            </div>

            <div className="hall-layout">
                {rows.map(rowNum => (
                    <div key={rowNum} className="row">
                        <div className="row-number">{rowNum}</div>
                        <div className="seats-list">
                            {seats
                                .filter(s => s.rowNumber === rowNum)
                                .sort((a, b) => a.seatNumber - b.seatNumber)
                                .map(seat => {
                                    const isSelected = selectedSeats.some(s => s.seatId === seat.seatId);
                                    return (
                                        <div
                                            key={seat.seatId}
                                            className={`seat-icon ${seat.type.toLowerCase()} 
                                                ${!seat.isAvailable ? 'occupied' : ''} 
                                                ${isSelected ? 'selected' : ''}`}
                                            onClick={() => toggleSeat(seat)}
                                            title={`Місце ${seat.seatNumber}, Ціна: ${seat.price} грн`}
                                        >
                                            {seat.seatNumber}
                                        </div>
                                    );
                                })}
                        </div>
                        <div className="row-number">{rowNum}</div>
                    </div>
                ))}
            </div>

            {/* Легенда */}
            <div className="legend">
                <div className="legend-item"><span className="dot standard"></span> Стандарт</div>
                <div className="legend-item"><span className="dot vip"></span> VIP</div>
                <div className="legend-item"><span className="dot occupied"></span> Зайнято</div>
                <div className="legend-item"><span className="dot selected"></span> Обрано</div>
            </div>

            {/* Нижня панель замовлення */}
            {selectedSeats.length > 0 && (
                <div className="order-panel">
                    <div className="order-info">
                        <p>Обрано місць: <b>{selectedSeats.length}</b></p>
                        <p>Загальна вартість: <span className="total-price">{Math.round(totalPrice)} грн</span></p>
                    </div>
                    <button className="book-now-btn">
                        Оформити квитки
                    </button>
                </div>
            )}
        </div>
    );
}