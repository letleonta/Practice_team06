import { Calendar, Clock, MapPin, Languages, Pencil } from 'lucide-react';
import type { SessionDto } from "../../types/session";

interface SessionItemProps {
    session: SessionDto;
    onDelete?: (id: number) => void;
    onClick?: (id: number) => void;
    onEdit?: (session: SessionDto) => void;
    variant?: 'admin' | 'client';
}

export const SessionItem = ({ session, onClick, onEdit, variant = 'admin' }: SessionItemProps) => {
    // ВАРІАНТ ДЛЯ КЛІЄНТА
    if (variant === 'client') {
        const sessionDate = new Date(session.startTime);
        return (
            <button
                onClick={() => onClick?.(session.id)}
                className="group flex flex-col items-center justify-center bg-[#0f1117] hover:bg-red-600 border border-white/5 hover:border-red-500 rounded-[28px] py-5 px-3 transition-all duration-300 shadow-lg hover:-translate-y-2"
            >
                <span className="text-[11px] text-red-500 group-hover:text-red-100 font-black uppercase tracking-tighter mb-1 transition-colors">
                    {sessionDate.toLocaleDateString('uk-UA', { day: 'numeric', month: 'short' })}
                </span>
                <span className="text-2xl font-black text-white group-hover:scale-110 transition-transform">
                    {sessionDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
                <div className="flex flex-col items-center gap-0.5 mt-2">
                    <span className="text-[10px] text-gray-600 group-hover:text-white/80 font-bold uppercase tracking-widest">
                        {session.hallName}
                    </span>
                    <span className="text-[9px] text-red-600/60 group-hover:text-red-200 font-black uppercase">
                        {session.languageName}
                    </span>
                </div>
            </button>
        );
    }

    // ВАРІАНТ ДЛЯ АДМІНА
    // Отримання дат початку та кінця
    const startDate = new Date(session.startTime);
    const endDate = new Date(session.endTime);

    // Форматування дати: "21.02.2026"
    const dateString = startDate.toLocaleDateString('uk-UA', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });

    const weekdayString = startDate.toLocaleDateString('uk-UA', { weekday: 'long' });
    const capitalizedWeekday = weekdayString.charAt(0).toUpperCase() + weekdayString.slice(1);

    return (
        <div className="bg-gray-900 p-4 rounded-2xl border border-gray-800 flex justify-between items-start group hover:border-gray-600 transition hover:bg-gray-800/50">
            <div className="min-w-0">

                <div className="flex items-center gap-3 mb-3">
                    <div className="bg-red-600/20 text-red-500 p-2.5 rounded-xl shrink-0">
                        <Clock size={18} />
                    </div>
                    <div className="flex flex-col leading-none">
                        <span className="font-black text-xl text-white tracking-tight">
                         {startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {endDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    </div>
                </div>

                {/* БЛОК ІНФОРМАЦІЇ */}
                <div className="space-y-1.5 ml-1">
                    <div className="flex items-center gap-2 text-xs text-gray-400 font-medium">
                        <Calendar size={12} />
                        <span>
                        {dateString}, <span className="text-gray-500 font-bold">{capitalizedWeekday}</span>
                    </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-300 font-bold">
                        <MapPin size={12} className="text-red-500" /> {session.hallName}
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-gray-500 uppercase tracking-wider font-bold">
                        <Languages size={10} /> {session.languageName}
                    </div>
                </div>
            </div>

            {/* КНОПКИ ДІЙ */}
            <div className="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                {onEdit && (
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onEdit(session);
                        }}
                        className="p-2 text-gray-600 hover:text-amber-500 hover:bg-amber-500/10 rounded-xl transition"
                        title="Редагувати"
                    >
                        <Pencil size={18} />
                    </button>
                )}
            </div>
        </div>
    );
};