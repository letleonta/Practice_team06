import { Film, MapPin, Phone, Mail, Armchair } from "lucide-react";
import { useEffect, useState } from "react";
import { HallService } from "../services/hall.service";
import type { HallDto } from "../types/hall";

const PAGE_SIZE = 3;

const AboutPage = () => {
    const [halls, setHalls] = useState<HallDto[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const loadHalls = async (page: number) => {
        try {
            const result = await HallService.getAll(page, PAGE_SIZE);
            setHalls(result.items);
            setTotalPages(Math.ceil(result.totalCount / PAGE_SIZE));
        } catch (error) {
            console.error("Помилка завантаження залів", error);
        }
    };

    useEffect(() => {
        loadHalls(currentPage);
    }, [currentPage]);

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

                    <div className="grid md:grid-cols-3 gap-8">
                        {halls.map(hall => (
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

                    {/* PAGINATION */}
                    <div className="flex justify-center mt-12 gap-3 flex-wrap">

                        {Array.from({ length: totalPages }, (_, i) => {
                            const page = i + 1;

                            return (
                                <button
                                    key={page}
                                    onClick={() => setCurrentPage(page)}
                                    className={`px-4 py-2 rounded-xl text-sm font-bold transition-all
                                        ${currentPage === page
                                        ? "bg-red-600 text-white shadow-lg shadow-red-600/30"
                                        : "bg-[#1a1d26] text-gray-300 hover:text-white hover:border-red-600/40 border border-white/5"
                                    }`}
                                >
                                    {page}
                                </button>
                            );
                        })}

                    </div>

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
