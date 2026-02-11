import { useState, useEffect } from 'react';
import { RotateCcw } from 'lucide-react';
import { BookingService } from '../../services/booking.service.ts';
import { BOOKING_CONFIG } from '../../config/constants.ts';
import { notify } from '../../utils/toast.ts';
import { ConfirmModal } from '../ui/ConfirmModal.tsx';

interface CancelBookingButtonProps {
    bookingId: number;
    startTime: string;
    status: string;
    title: string;
    onCancelSuccess: () => void | Promise<void>;
}

export const CancelBookingButton = ({
                                        bookingId,
                                        startTime,
                                        status,
                                        title,
                                        onCancelSuccess
                                    }: CancelBookingButtonProps) => {
    const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [canCancel, setCanCancel] = useState(false);
    const [isTooLate, setIsTooLate] = useState(false);

    useEffect(() => {
        const checkStatus = () => {
            if (status === 'Cancelled') {
                setCanCancel(false);
                return;
            }

            const startString = startTime.endsWith('Z') ? startTime : `${startTime}Z`;
            const startTimeMs = new Date(startString).getTime();
            const now = Date.now();

            const tooLate = (startTimeMs - now) < BOOKING_CONFIG.CANCELLATION_MS;

            setIsTooLate(tooLate);
            setCanCancel(!tooLate);
        };

        checkStatus();
        const interval = setInterval(checkStatus, 60000);
        return () => clearInterval(interval);
    }, [startTime, status]);

    const handleConfirmCancel = async () => {
        setIsLoading(true);
        try {
            await BookingService.cancelBooking(bookingId);
            notify.success("Бронювання скасовано");
            await onCancelSuccess();
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : "Помилка сервера";
            notify.error(message);
        } finally {
            setIsLoading(false);
            setIsCancelModalOpen(false);
        }
    };

    if (status === 'Cancelled') return null;

    return (
        <>
            <button
                type="button"
                onClick={() => setIsCancelModalOpen(true)}
                disabled={!canCancel || isLoading}
                title={isTooLate ? `Скасування можливе не пізніше ніж за ${BOOKING_CONFIG.CANCELLATION_MINUTES} хв` : ""}
                className={`flex-1 flex items-center justify-center gap-3 px-6 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all border
                    ${canCancel
                    ? 'bg-gray-800 hover:bg-orange-600/20 text-white hover:text-orange-500 border-transparent hover:border-orange-600/30 cursor-pointer active:scale-95'
                    : 'bg-gray-900/40 text-gray-600 border-gray-800 cursor-not-allowed opacity-50'
                }
                `}
            >
                <RotateCcw size={16} className={isLoading ? "animate-spin" : ""} />
                <span className="whitespace-nowrap">
                    {isLoading ? "Скасування..." : "Скасувати бронювання"}
                </span>
            </button>

            <ConfirmModal
                isOpen={isCancelModalOpen}
                title="Скасувати бронювання?"
                variant="danger"
                confirmText="Так, скасувати"
                cancelText="Ні, залишити"
                description={
                    <div className="space-y-2">
                        <p>Ви впевнені, що хочете скасувати бронювання на фільм <b>{title}</b>?</p>
                        <p className="text-xs text-gray-500">
                            Кошти будуть повернуті, а місця знову стануть доступними для продажу.
                        </p>
                    </div>
                }
                onConfirm={handleConfirmCancel}
                onClose={() => setIsCancelModalOpen(false)}
                isLoading={isLoading}
            />
        </>
    );
};