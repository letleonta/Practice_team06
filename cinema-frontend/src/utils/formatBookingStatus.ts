import type {BookingStatus} from "../types/booking.ts";

export const getStatusColor = (status: BookingStatus) => {
    switch (status.toString().toLowerCase()) {
        case 'paid':
        case 'оплачено':
            return 'bg-green-500/20 text-green-400 border-green-500/30';
        case 'inprogress':
        case 'в процесі':
            return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
        case 'cancelled':
        case 'скасовано':
            return 'bg-red-500/20 text-red-400 border-red-500/30';
        default:
            return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
};

export const getStatusText = (status: BookingStatus) => {
    const statusMap: { [key: string]: string } = {
        'paid': 'Оплачено',
        'inprogress': 'В процесі',
        'cancelled': 'Скасовано',
    };
    return statusMap[status.toString().toLowerCase()] || status;
};