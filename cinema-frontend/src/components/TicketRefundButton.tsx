import { useState, useEffect } from 'react';
import { RotateCcw } from 'lucide-react';
import { BOOKING_CONFIG } from '../config/constants';

interface TicketRefundButtonProps {
    startTime: string | Date;
    isActive: boolean;
    variant?: 'icon' | 'vertical';
    onClick: () => void;
}

export const TicketRefundButton = ({ startTime, isActive, variant = 'vertical', onClick }: TicketRefundButtonProps) => {
    const [canRefund, setCanRefund] = useState(false);

    useEffect(() => {
        const checkTime = () => {
            if (!startTime || !isActive) {
                setCanRefund(false);
                return;
            }

            const startStr = startTime.toString();
            const startString = startStr.endsWith('Z') ? startStr : `${startStr}Z`;
            const startTimeMs = new Date(startString).getTime();
            const now = Date.now();

            const isTooLate = (startTimeMs - now) < BOOKING_CONFIG.CANCELLATION_MS;
            setCanRefund(!isTooLate);
        };

        checkTime();
        const interval = setInterval(checkTime, 60000);
        return () => clearInterval(interval);
    }, [startTime, isActive]);

    const titleText = !canRefund && isActive
        ? `Повернення неможливе (менше ${BOOKING_CONFIG.CANCELLATION_MINUTES} хв до сеансу)`
        : "";

    if (variant === 'icon') {
        return (
            <button
                type="button"
                onClick={onClick}
                disabled={!canRefund}
                title={titleText}
                className={`flex flex-col items-center gap-2 transition-all group ${
                    canRefund
                        ? "text-gray-500 hover:text-orange-500"
                        : "text-gray-800 cursor-not-allowed opacity-30"
                }`}
            >
                <div className={`p-3 rounded-2xl transition-all ${
                    canRefund
                        ? "bg-gray-800/30 group-hover:bg-gray-800"
                        : "bg-gray-900/10"
                }`}>
                    <RotateCcw size={20}/>
                </div>
                <span className="text-[10px] font-black uppercase tracking-tight">
                    Повернути
                </span>
            </button>
        );
    }
    return (
        <button
            type="button"
            onClick={onClick}
            disabled={!canRefund}
            title={titleText}
            className={`flex flex-col items-center gap-2 transition-all group ${
                canRefund
                    ? "text-gray-500 hover:text-orange-500"
                    : "text-gray-800 cursor-not-allowed opacity-30"
            }`}
        >
            <div className={`p-1.5 rounded-lg transition-all ${
                canRefund
                    ? "hover:bg-orange-500/10"
                    : "bg-gray-900/10"
            }`}>
                <RotateCcw size={14} />
            </div>
        </button>
    );
};