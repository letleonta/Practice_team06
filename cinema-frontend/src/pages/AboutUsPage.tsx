import {Film, MapPin, Phone, Mail, Armchair, Send, MessageCircle} from "lucide-react";
import { HallService } from "../services/hall.service";
import { Pagination } from "../components/ui/Pagination.tsx";
import { UsePagination } from "../hooks/UsePagination";
import type { HallDto } from "../types/hall";

const PAGE_SIZE = 3;

const AboutPage = () => {

    const fetchHalls = async (Page: number, PageSize: number) => {
        return await HallService.getAll(Page, PageSize);
    };

    const {
        items: halls,
        totalPages,
        currentPage,
        loading,
        error,
        goToPage
    } = UsePagination<HallDto>(fetchHalls, [], { pageSize: PAGE_SIZE });

    return (
        <div className="min-h-screen bg-[#0f1117] text-white font-sans overflow-x-hidden">

            {/* HERO */}
            <section className="relative h-[70vh] flex items-center justify-center overflow-hidden">
                <img
                    src="https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=2070"
                    className="absolute inset-0 w-full h-full object-cover opacity-30"
                />

                <div className="absolute inset-0 bg-gradient-to-b from-[#0f1117]/20 via-[#0f1117]/80 to-[#0f1117]" />

                <div className="relative z-10 text-center max-w-4xl px-6">
                    <h1 className="text-6xl md:text-8xl font-black tracking-tighter mb-6">
                        ПРО НАС
                    </h1>
                    <p className="text-gray-300 text-lg md:text-xl font-medium">
                        Сучасний кінотеатр, що поєднує технології, комфорт та атмосферу справжнього кіно.
                    </p>
                </div>
            </section>

            <div className="max-w-7xl mx-auto px-6 py-20 space-y-24">

                {/* ПРО КІНОТЕАТР */}
                <section className="bg-[#1a1d26] p-10 rounded-[40px] border border-white/5 shadow-2xl">
                    <div className="flex items-center gap-4 mb-6">
                        <Film className="text-red-600" size={36} />
                        <h2 className="text-3xl font-bold tracking-tight">Про кінотеатр</h2>
                    </div>

                    <p className="text-gray-300 text-lg leading-relaxed">
                        Наш кінотеатр створений для справжніх поціновувачів кіно.
                    </p>
                </section>

                {/* ЗАЛИ */}
                <section>
                    <div className="flex items-center gap-4 mb-10">
                        <Armchair className="text-red-600" size={36} />
                        <h2 className="text-3xl font-bold tracking-tight">Наші зали</h2>
                    </div>

                    {loading ? (
                        <div className="flex justify-center py-20">
                            <div className="h-16 w-16 rounded-full border-4 border-gray-800 border-t-red-600 animate-spin"></div>
                        </div>
                    ) : error ? (
                        <div className="text-center py-20">
                            <p className="text-red-500">{error}</p>
                        </div>
                    ) : (
                        <>
                            <div className="grid md:grid-cols-3 gap-8">
                                {halls.map((hall) => (
                                    <div
                                        key={hall.id}
                                        className="bg-[#1a1d26] p-8 rounded-3xl border border-white/5 hover:border-red-600/40 transition-all"
                                    >
                                        <h3 className="text-xl font-bold mb-4">
                                            {hall.name}
                                        </h3>

                                        <p className="text-gray-400">
                                            {hall.description || "Опис залу відсутній"}
                                        </p>
                                    </div>
                                ))}
                            </div>

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <Pagination
                                    currentPage={currentPage}
                                    totalPages={totalPages}
                                    onPageChange={goToPage}
                                    className="mt-12"
                                />
                            )}
                        </>
                    )}
                </section>

                {/* КОНТАКТИ */}
                <section className="bg-[#1a1d26] p-10 rounded-[40px] border border-white/5 shadow-2xl">
                    <h2 className="text-3xl font-bold tracking-tight mb-10">Контакти</h2>

                    <div className="grid md:grid-cols-3 gap-8">

                        <div className="flex items-start gap-4">
                            <MapPin className="text-red-600 mt-1" />
                            <div>
                                <p className="font-bold">Адреса</p>
                                <p className="text-gray-400">м. Київ, вул. Кінотеатральна, 1</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4">
                            <Phone className="text-red-600 mt-1" />
                            <div>
                                <p className="font-bold">Телефон</p>
                                <p className="text-gray-400">+380 99 123 45 67</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4">
                            <Mail className="text-red-600 mt-1" />
                            <div>
                                <p className="font-bold">Email</p>
                                <p className="text-gray-400">cinema@example.com</p>
                            </div>
                        </div>
                        {/* TELEGRAM */}
                        <div className="flex items-start gap-4">
                            <Send className="text-red-600 mt-1" />
                            <div>
                                <p className="font-bold">Telegram підтримка</p>
                                <p className="text-gray-400">@CinemaSupportUA</p>
                            </div>
                        </div>

                        {/* VIBER */}
                        <div className="flex items-start gap-4">
                            <MessageCircle className="text-red-600 mt-1" />
                            <div>
                                <p className="font-bold">Viber підтримка</p>
                                <p className="text-gray-400">+380 95 713 44 29</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* МАПА */}
                <section className="rounded-[40px] overflow-hidden border border-white/5 shadow-2xl">
                    <iframe
                        title="Cinema Location"
                        src="https://www.google.com/maps?q=Kyiv&output=embed"
                        className="w-full h-[500px] border-0"
                        loading="lazy"
                    />
                </section>

            </div>
        </div>
    );
};

export default AboutPage;
