import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import api from '../../api/axiosInstance';
import type { CreateMovieDto } from '../../types/movie';
import { Film, Image, Clock, DollarSign, Calendar, Users, UserPlus, Info } from 'lucide-react';

const AdminMovies = () => {
    const { register, handleSubmit, reset} = useForm<CreateMovieDto>();

    const [genres, setGenres] = useState<{id: number, name: string}[]>([]);
    const [directors, setDirectors] = useState<{id: number, name: string}[]>([]);
    const [actors, setActors] = useState<{id: number, name: string}[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [genresRes, directorsRes, actorsRes] = await Promise.all([
                    api.get('/genres'),
                    api.get('/directors'),
                    api.get('/actors')
                ]);
                setGenres(genresRes.data);
                setDirectors(directorsRes.data);
                setActors(actorsRes.data);
            } catch (err) {
                console.error("Помилка завантаження даних для форми:", err);
            }
        };
        fetchData();
    }, []);

    const onSubmit = async (data: any) => {
        try {
            // Форматування даних перед відправкою на C# бекенд
            const formattedData = {
                ...data,
                durationMin: Number(data.durationMin),
                basePrice: Number(data.basePrice),
                directorId: data.directorId ? Number(data.directorId) : null,
                ageRestriction: Number(data.ageRestriction),
                // Перетворюємо вибрані чекбокси в масиви чисел (ID)
                genreIds: data.genreIds ? data.genreIds.map(Number) : [],
                actorIds: data.actorIds ? data.actorIds.map(Number) : [],
            };

            await api.post('/movies', formattedData);
            alert('Фільм успішно додано!');
            reset();
        } catch (err: any) {
            console.error("Помилка при збереженні фільму:", err);
            alert('Помилка при додаванні. Перевірте консоль розробника.');
        }
    };

    return (
        <div className="max-w-6xl mx-auto pb-20">
            <h2 className="text-3xl font-black mb-8 flex items-center gap-3 tracking-tight">
                <Film className="text-red-600" size={32} /> КЕРУВАННЯ ФІЛЬМАМИ
            </h2>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                    {/* КОЛОНКА 1: Контент */}
                    <div className="bg-[#1a1d26] p-8 rounded-[32px] border border-gray-800 shadow-2xl space-y-6">
                        <div className="flex items-center gap-2 text-red-500 mb-2">
                            <Info size={18} />
                            <h3 className="text-sm font-black uppercase tracking-[0.2em]">Основна інформація</h3>
                        </div>

                        <div>
                            <label className="block text-xs text-gray-500 mb-2 ml-1 font-bold">НАЗВА ФІЛЬМУ</label>
                            <input {...register('title', { required: true })} className="w-full p-4 bg-gray-900 border border-gray-700 rounded-2xl outline-none focus:border-red-500 text-white transition-all shadow-inner" placeholder="Напр. Інтерстеллар" />
                        </div>

                        <div>
                            <label className="block text-xs text-gray-500 mb-2 ml-1 font-bold">ОПИС</label>
                            <textarea {...register('description')} className="w-full p-4 bg-gray-900 border border-gray-700 rounded-2xl h-40 outline-none focus:border-red-500 text-white resize-none shadow-inner" placeholder="Короткий опис сюжету..." />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs text-gray-500 mb-2 ml-1 font-bold flex items-center gap-1"><Clock size={14}/> ТРИВАЛІСТЬ (ХВ)</label>
                                <input {...register('durationMin', { required: true })} type="number" className="w-full p-4 bg-gray-900 border border-gray-700 rounded-2xl outline-none focus:border-red-500 text-white shadow-inner" />
                            </div>
                            <div>
                                <label className="block text-xs text-gray-500 mb-2 ml-1 font-bold flex items-center gap-1"><DollarSign size={14}/> ЦІНА (ГРН)</label>
                                <input {...register('basePrice', { required: true })} type="number" step="0.01" className="w-full p-4 bg-gray-900 border border-gray-700 rounded-2xl outline-none focus:border-red-500 text-white shadow-inner" />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs text-gray-500 mb-2 ml-1 font-bold uppercase tracking-wider text-amber-500">Віковий ценз</label>
                            <select {...register('ageRestriction')} className="w-full p-4 bg-gray-900 border border-gray-700 rounded-2xl outline-none focus:border-red-500 text-white cursor-pointer appearance-none shadow-inner">
                                <option value="0">0+ (G) - Без обмежень</option>
                                <option value="12">12+ (PG-13)</option>
                                <option value="16">16+ (R)</option>
                                <option value="18">18+ (NC-17)</option>
                            </select>
                        </div>
                    </div>

                    {/* КОЛОНКА 2: Медіа та Персони */}
                    <div className="space-y-8">
                        {/* Медіа */}
                        <div className="bg-[#1a1d26] p-8 rounded-[32px] border border-gray-800 shadow-2xl space-y-6">
                            <div className="flex items-center gap-2 text-red-500 mb-2">
                                <Image size={18} />
                                <h3 className="text-sm font-black uppercase tracking-[0.2em]">Медіа та Дати</h3>
                            </div>

                            <div>
                                <label className="block text-xs text-gray-500 mb-2 ml-1 font-bold italic underline decoration-red-600">ПОСИЛАННЯ НА ПОСТЕР (URL)</label>
                                <input {...register('posterUri')} className="w-full p-4 bg-gray-900 border border-gray-700 rounded-2xl outline-none focus:border-red-500 text-white shadow-inner" placeholder="https://image-url.com/poster.jpg" />
                            </div>

                            <div className="grid grid-cols-1 gap-4 p-5 bg-gray-900 rounded-3xl border border-gray-800 shadow-inner">
                                <div>
                                    <label className="block text-[10px] text-gray-500 mb-1 font-black flex items-center gap-2"><Calendar size={12}/> ДАТА СВІТОВОЇ ПРЕМ'ЄРИ</label>
                                    <input {...register('releaseDate', { required: true })} type="date" className="w-full p-3 bg-gray-800 border border-gray-700 rounded-xl text-white outline-none focus:border-red-500" />
                                </div>
                                <div>
                                    <label className="block text-[10px] text-gray-500 mb-1 font-black flex items-center gap-2 text-green-500"><Calendar size={12}/> ПОЧАТОК ПРОКАТУ У НАС</label>
                                    <input {...register('startDate', { required: true })} type="date" className="w-full p-3 bg-gray-800 border border-gray-700 rounded-xl text-white outline-none focus:border-red-500" />
                                </div>
                                <div>
                                    <label className="block text-[10px] text-gray-500 mb-1 font-black flex items-center gap-2 text-red-500"><Calendar size={12}/> КІНЕЦЬ ПРОКАТУ</label>
                                    <input {...register('endDate', { required: true })} type="date" className="w-full p-3 bg-gray-800 border border-gray-700 rounded-xl text-white outline-none focus:border-red-500" />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs text-gray-500 mb-2 ml-1 font-bold flex items-center gap-1"><Users size={14}/> РЕЖИСЕР</label>
                                <select {...register('directorId')} className="w-full p-4 bg-gray-900 border border-gray-700 rounded-2xl text-white appearance-none cursor-pointer focus:border-red-500 outline-none shadow-inner">
                                    <option value="">Оберіть режисера зі списку</option>
                                    {directors.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                {/* НИЖНІ СЕКЦІЇ: Жанри та Актори */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
                    {/* ЖАНРИ */}
                    <div className="bg-[#1a1d26] p-8 rounded-[32px] border border-gray-800 shadow-2xl">
                        <div className="flex items-center gap-2 text-red-500 mb-6">
                            <Info size={18} />
                            <h3 className="text-sm font-black uppercase tracking-[0.2em]">Жанри</h3>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            {genres.map(genre => (
                                <label key={genre.id} className="flex items-center gap-3 bg-gray-900 p-4 rounded-2xl border border-gray-800 cursor-pointer hover:border-red-500/50 hover:bg-red-500/5 transition-all group shadow-sm">
                                    <input type="checkbox" value={genre.id} {...register('genreIds')} className="w-5 h-5 accent-red-600 rounded-lg cursor-pointer transition-transform group-hover:scale-110" />
                                    <span className="text-sm text-gray-300 group-hover:text-white font-medium">{genre.name}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* АКТОРИ */}
                    <div className="bg-[#1a1d26] p-8 rounded-[32px] border border-gray-800 shadow-2xl">
                        <div className="flex items-center gap-2 text-red-500 mb-6">
                            <UserPlus size={18} />
                            <h3 className="text-sm font-black uppercase tracking-[0.2em]">Акторський склад</h3>
                        </div>
                        <div className="grid grid-cols-2 gap-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                            {actors.map(actor => (
                                <label key={actor.id} className="flex items-center gap-3 bg-gray-900 p-4 rounded-2xl border border-gray-800 cursor-pointer hover:border-red-500/50 hover:bg-red-500/5 transition-all group shadow-sm">
                                    <input type="checkbox" value={actor.id} {...register('actorIds')} className="w-5 h-5 accent-red-600 rounded-lg cursor-pointer transition-transform group-hover:scale-110" />
                                    <span className="text-sm text-gray-300 group-hover:text-white font-medium">{actor.name}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                </div>

                <button type="submit" className="w-full bg-red-600 hover:bg-red-700 text-white font-black py-5 rounded-[24px] transition-all shadow-2xl shadow-red-600/30 uppercase tracking-[0.3em] text-lg hover:-translate-y-1 active:scale-95">
                    ЗБЕРЕГТИ ФІЛЬМ У СИСТЕМУ
                </button>
            </form>
        </div>
    );
};

export default AdminMovies;