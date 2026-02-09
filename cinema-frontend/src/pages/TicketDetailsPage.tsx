import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, Clock, Map, Download, Share2, X, RotateCcw, ZoomIn } from 'lucide-react';
import { formatDateWithYear, formatTime } from '../utils/formatTime';
import { AgeRestrictionBadge } from '../components/AgeRestrictionBadge';
import { TicketService } from "../services/ticket.service.ts";
import type { TicketDto } from "../types/ticket.ts";
import { notify } from "../utils/toast.ts";
import { ConfirmModal } from "../components/ui/ConfirmModal.tsx";

const TicketDetailsPage = () => {
    const { ticketId } = useParams<{ ticketId: string }>();
    const navigate = useNavigate();
    const [ticket, setTicket] = useState<TicketDto | null>(null);
    const [loading, setLoading] = useState(true);

    const [isQrZoomed, setIsQrZoomed] = useState(false);
    const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);
    const [isReturning, setIsReturning] = useState(false);

    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=TICKET-${ticket?.id}`;

    useEffect(() => {
        const fetchTicket = async () => {
            try {
                const data = await TicketService.getById(Number(ticketId));
                setTicket(data as TicketDto);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchTicket();
    }, [ticketId]);

    const canRefund = () => {
        if (!ticket) return false;
        const startTime = new Date(ticket.startTime).getTime();
        const now = new Date().getTime();
        const diff = startTime - now;
        return diff > 30 * 60 * 1000; // 30 хвилин у мілісекундах
    };

    const handleReturnTicket = async () => {
        if (!ticket) return;
        setIsReturning(true);
        try {
            await TicketService.refund(ticket.id);
            notify.success("Квиток успішно повернуто");
            navigate('/bookings/my');
        } catch (err: any) {
            notify.error(err.response?.data || "Не вдалося повернути квиток");
        } finally {
            setIsReturning(false);
            setIsReturnModalOpen(false);
        }
    };

    if (loading) return (
        <div className="min-h-screen bg-[#0f1117] flex items-center justify-center">
            <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
        </div>
    );

    if (!ticket) return (
        <div className="min-h-screen bg-[#0f1117] text-white flex flex-col items-center justify-center">
            <p className="text-xl text-gray-500 mb-4">Квиток не знайдено</p>
            <button onClick={() => navigate(-1)} className="text-red-600 flex items-center gap-2">
                <ArrowLeft size={20} /> Повернутись
            </button>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#0f1117] text-white p-4 md:p-8">
            <div className="max-w-xl mx-auto">
                <button
                    onClick={() => navigate(-1)}
                    className="inline-flex items-center gap-2 text-gray-400 hover:text-red-600 mb-6 transition-colors group"
                >
                    <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                    Назад до бронювання
                </button>

                <div className="relative group">
                    <div className="bg-[#1a1d26] rounded-t-[2.5rem] border-x border-t border-gray-800 overflow-hidden">
                        <div className="relative h-64 bg-[#1a1d26] overflow-hidden">
                            <img
                                src={ticket.moviePoster || ''}
                                alt={ticket.movieTitle || ''}
                                className="absolute inset-0 w-full h-full object-cover block blur-[1px] group-hover:scale-110 transition-transform duration-700"
                            />
                            <div className="absolute inset-0 bg-black/60 pointer-events-none" />
                            <div className="absolute inset-x-0 -bottom-px h-full bg-linear-to-t from-[#1a1d26] via-transparent to-transparent pointer-events-none" />
                            <div className="absolute bottom-6 left-8 right-8 z-10">
                                <div className="flex mb-3">
                                    <AgeRestrictionBadge
                                        restriction={ticket.ageRestriction}
                                    />
                                </div>
                                <h1 className="text-3xl font-black tracking-tighter uppercase leading-tight mt-2 drop-shadow-2xl">
                                    {ticket.movieTitle}
                                </h1>
                            </div>
                        </div>

                        <div className="p-8 grid grid-cols-2 gap-y-8 gap-x-4">
                            <div className="space-y-1">
                                <p className="text-gray-500 text-[10px] font-black uppercase tracking-[0.2em]">Дата</p>
                                <div className="flex items-center gap-2.5">
                                    <div className="p-2 rounded-lg bg-red-600/10"><Calendar size={16} className="text-red-600" /></div>
                                    <span className="font-bold text-sm">{formatDateWithYear(ticket.startTime.toString())}</span>
                                </div>
                            </div>
                            <div className="space-y-1">
                                <p className="text-gray-500 text-[10px] font-black uppercase tracking-[0.2em]">Час</p>
                                <div className="flex items-center gap-2.5">
                                    <div className="p-2 rounded-lg bg-red-600/10"><Clock size={16} className="text-red-600" /></div>
                                    <span className="font-bold text-sm">{formatTime(ticket.startTime.toString())}</span>
                                </div>
                            </div>
                            <div className="space-y-1">
                                <p className="text-gray-500 text-[10px] font-black uppercase tracking-[0.2em]">Зал</p>
                                <div className="flex items-center gap-2.5">
                                    <div className="p-2 rounded-lg bg-red-600/10"><Map size={16} className="text-red-600" /></div>
                                    <span className="font-bold text-sm">{ticket.hallName}</span>
                                </div>
                            </div>
                            <div className="space-y-1">
                                <p className="text-gray-500 text-[10px] font-black uppercase tracking-[0.2em]">Місце</p>
                                <div className="text-lg font-black text-red-600">
                                    РЯД {ticket.rowNumber}, МІСЦЕ {ticket.seatNumber}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Перфорація */}
                    <div className="relative h-10 bg-[#1a1d26] border-x border-gray-800 flex items-center justify-between overflow-hidden">
                        <div className="absolute -left-5 w-10 h-10 bg-[#0f1117] rounded-full border border-gray-800 shadow-inner" />
                        <div className="w-full border-t-2 border-dashed border-gray-800/50 mx-8" />
                        <div className="absolute -right-5 w-10 h-10 bg-[#0f1117] rounded-full border border-gray-800 shadow-inner" />
                    </div>

                    <div className="bg-[#1a1d26] rounded-b-[2.5rem] border-x border-b border-gray-800 p-8 flex flex-col items-center shadow-2xl">
                        <div
                            onClick={() => setIsQrZoomed(true)}
                            className="relative bg-white p-3 rounded-2xl mb-5 shadow-[0_0_30px_rgba(255,255,255,0.05)] cursor-zoom-in group/qr transition-all hover:scale-105"
                        >
                            <img
                                src={qrUrl}
                                alt="QR Code"
                                className="w-40 h-40"
                            />
                            <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover/qr:opacity-100 transition-all duration-300 rounded-2xl backdrop-blur-[1px]">
                                <div className="bg-black/60 p-3 rounded-full scale-75 group-hover/qr:scale-100 transition-transform duration-300 shadow-xl border border-white/20">
                                    <ZoomIn className="text-white" size={28} />
                                </div>
                            </div>
                        </div>

                        <p className="text-[10px] font-mono text-gray-600 tracking-widest uppercase">
                            ID: {ticket.id.toString().padStart(12, '0')}
                        </p>

                        <p className="text-center text-gray-500 text-xs leading-relaxed px-12 opacity-60 mb-5">
                            Натисніть на QR-код, щоб збільшити його для контролера. Квиток дійсний лише на вказаний час.
                        </p>

                        <div className="w-full pt-6 border-t border-gray-800/50 flex justify-around">
                            <button className="flex flex-col items-center gap-2 text-gray-500 hover:text-red-500 transition-all">
                                <div className="p-3 rounded-2xl bg-gray-800/30 group-hover:bg-gray-800"><Download size={20} /></div>
                                <span className="text-[10px] font-black uppercase">Завантажити</span>
                            </button>
                            <button className="flex flex-col items-center gap-2 text-gray-500 hover:text-blue-500 transition-all">
                                <div className="p-3 rounded-2xl bg-gray-800/30 group-hover:bg-gray-800"><Share2 size={20} /></div>
                                <span className="text-[10px] font-black uppercase">Надіслати</span>
                            </button>
                            <button
                                onClick={() => setIsReturnModalOpen(true)}
                                disabled={!canRefund()}
                                className={`flex flex-col items-center gap-2 transition-all ${
                                    canRefund()
                                        ? "text-gray-500 hover:text-orange-500"
                                        : "text-gray-800 cursor-not-allowed opacity-30"
                                }`}
                                title={!canRefund() ? "Повернення неможливе (менше 30 хв до сеансу)" : ""}
                            >
                                <div className="p-3 rounded-2xl bg-gray-800/30 group-hover:bg-gray-800"><RotateCcw size={20} /></div>
                                <span className="text-[10px] font-black uppercase">Повернути</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {isQrZoomed && (
                <div
                    className="fixed inset-0 z-100 bg-black/95 backdrop-blur-xl flex flex-col items-center justify-center p-6 animate-in fade-in duration-300"
                    onClick={() => setIsQrZoomed(false)}
                >
                    <button className="absolute top-8 right-8 text-white/50 hover:text-white transition-colors">
                        <X size={40} strokeWidth={1} />
                    </button>

                    <div className="bg-white p-6 rounded-[3rem] shadow-[0_0_80px_rgba(255,255,255,0.15)] mb-10 transform scale-110">
                        <img src={qrUrl} alt="QR Large" className="w-72 h-72 md:w-100 md:h-100" />
                    </div>

                    <div className="text-center space-y-2">
                        <h3 className="text-2xl font-black uppercase tracking-tighter">{ticket.movieTitle}</h3>
                        <p className="text-red-600 font-bold uppercase tracking-widest text-sm">Покажіть цей код контролеру</p>
                    </div>
                </div>
            )}

            <ConfirmModal
                isOpen={isReturnModalOpen}
                title="Повернути квиток?"
                description="Кошти будуть повернуті на ваш баланс. Квиток стане недійсним і місце знову з'явиться у продажу."
                confirmText="Так, повернути"
                cancelText="Скасувати"
                variant="danger"
                onConfirm={handleReturnTicket}
                onClose={() => setIsReturnModalOpen(false)}
                isLoading={isReturning}
            />
        </div>
    );
};

export default TicketDetailsPage;