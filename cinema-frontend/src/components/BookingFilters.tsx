import { User, X } from 'lucide-react';

interface BookingFiltersProps {
    userEmail: string;
    setUserEmail: (val: string) => void;
    sessionFrom: string;
    setSessionFrom: (val: string) => void;
    sessionTo: string;
    setSessionTo: (val: string) => void;
    bookingFrom: string;
    setBookingFrom: (val: string) => void;
    bookingTo: string;
    setBookingTo: (val: string) => void;
}

export const BookingFilters = ({
                                   userEmail, setUserEmail,
                                   sessionFrom, setSessionFrom,
                                   sessionTo, setSessionTo,
                                   bookingFrom, setBookingFrom,
                                   bookingTo, setBookingTo
                               }: BookingFiltersProps) => {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-5">
            {/* User Email */}
            <div className="flex flex-col gap-1.5">
                <label className="text-xs text-gray-500 uppercase tracking-wider">Пошук за Email</label>
                    <div className="relative">
                    <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" />
                    <input
                        type="text"
                        placeholder="Частина email..."
                        value={userEmail}
                        onChange={e => setUserEmail(e.target.value)}
                        className="w-full pl-8 pr-3 py-2 rounded-lg bg-gray-800 border border-gray-700 text-sm text-white focus:outline-none focus:border-red-600/50 transition-colors"
                    />
                    {userEmail && (
                        <button onClick={() => setUserEmail('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-red-500">
                        <X size={14} />
                        </button>
                    )}
                </div>
            </div>

            {/* Дати сеансу */}
            <div className="flex flex-col gap-1.5">
                <label className="text-xs text-gray-500 uppercase tracking-wider">Сеанс від / до</label>
                <div className="flex items-center gap-2">
                    <input
                        type="date"
                        value={sessionFrom}
                        onChange={e => setSessionFrom(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-gray-800 border border-gray-700 text-sm text-white focus:border-red-600/50"
                    />
                    <input
                        type="date"
                        value={sessionTo}
                        onChange={e => setSessionTo(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-gray-800 border border-gray-700 text-sm text-white focus:border-red-600/50"
                    />
                </div>
            </div>

            {/* Дати бронювання */}
            <div className="flex flex-col gap-1.5">
                <label className="text-xs text-gray-500 uppercase tracking-wider">Бронь від / до</label>
                <div className="flex items-center gap-2">
                    <input
                        type="date"
                        value={bookingFrom}
                        onChange={e => setBookingFrom(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-gray-800 border border-gray-700 text-sm text-white focus:border-red-600/50"
                    />
                    <input
                        type="date"
                        value={bookingTo}
                        onChange={e => setBookingTo(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-gray-800 border border-gray-700 text-sm text-white focus:border-red-600/50"
                    />
                </div>
            </div>
        </div>
    );
};