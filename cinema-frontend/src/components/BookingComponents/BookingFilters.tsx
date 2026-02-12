import {Filter, Hash, User, X} from 'lucide-react';

interface BookingFiltersProps {
    status: string;
    setStatus: (val: string) => void;
    userEmail: string;
    setUserEmail: (val: string) => void;
    sessionId: string;
    setSessionId: (val: string) => void;
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
                                   status, setStatus,
                                   userEmail, setUserEmail,
                                   sessionId, setSessionId,
                                   sessionFrom, setSessionFrom,
                                   sessionTo, setSessionTo,
                                   bookingFrom, setBookingFrom,
                                   bookingTo, setBookingTo
                               }: BookingFiltersProps) => {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-x-4 gap-y-5">
            <div className="flex flex-col gap-1.5">
                <label className="text-xs text-gray-500 uppercase tracking-wider">Статус</label>
                <div className="relative">
                    <Filter size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600 pointer-events-none" />
                    <select
                        value={status}
                        onChange={e => setStatus(e.target.value)}
                        className="w-full pl-8 pr-3 py-2 rounded-lg bg-gray-800 border border-gray-700 text-sm text-white focus:outline-none focus:border-red-600/50 transition-colors appearance-none cursor-pointer"
                    >
                        <option value="ALL">Всі статуси</option>
                        <option value="Paid">Оплачені</option>
                        <option value="InProgress">В процесі</option>
                        <option value="Cancelled">Скасовані</option>
                    </select>
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-600">
                        <svg width="10" height="6" viewBox="0 0 10 6" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 1L5 5L9 1"/></svg>
                    </div>
                </div>
            </div>
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

            <div className="flex flex-col gap-1.5">
                <label className="text-xs text-gray-500 uppercase tracking-wider">ID Сеансу</label>
                <div className="relative">
                    <Hash size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" />
                    <input
                        type="number"
                        placeholder="Номер сеансу..."
                        value={sessionId}
                        onChange={e => setSessionId(e.target.value)}
                        className="w-full pl-8 pr-3 py-2 rounded-lg bg-gray-800 border border-gray-700 text-sm text-white focus:outline-none focus:border-red-600/50 transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                    {sessionId && (
                        <button onClick={() => setSessionId('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-red-500">
                            <X size={14} />
                        </button>
                    )}
                </div>
            </div>

            <div className="flex flex-col gap-1.5">
                <label className="text-xs text-gray-500 uppercase tracking-wider">Сеанс від / до</label>
                <div className="flex flex-wrap items-center gap-2">
                    <input
                        type="date"
                        defaultValue={sessionFrom}
                        onChange={e => setSessionFrom(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-gray-800 border border-gray-700 text-sm text-white focus:border-red-600/50"
                    />
                    <input
                        type="date"
                        defaultValue={sessionTo}
                        onChange={e => setSessionTo(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-gray-800 border border-gray-700 text-sm text-white focus:border-red-600/50"
                    />
                </div>
            </div>

            <div className="flex flex-col gap-1.5">
                <label className="text-xs text-gray-500 uppercase tracking-wider">Бронь від / до</label>
                <div className="flex flex-wrap items-center gap-2">
                    <input
                        type="date"
                        defaultValue={bookingFrom}
                        onChange={e => setBookingFrom(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-gray-800 border border-gray-700 text-sm text-white focus:border-red-600/50"
                    />
                    <input
                        type="date"
                        defaultValue={bookingTo}
                        onChange={e => setBookingTo(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-gray-800 border border-gray-700 text-sm text-white focus:border-red-600/50"
                    />
                </div>
            </div>
        </div>
    );
};