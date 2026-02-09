import { useEffect, useState, useMemo } from 'react';
import { SessionService } from '../../services/session.service';
import type { CreateSessionDto, SessionDto } from '../../types/session';
import type { MovieDto } from '../../types/movie';
import type { HallDto } from "../../types/hall";
import type { LanguageDto } from "../../types/language";
import { HallService } from "../../services/hall.service";
import { LanguageService } from "../../services/language.service";
import { ConfirmModal } from "../../components/ui/ConfirmModal";
import { notify } from "../../utils/toast";
import { Film, PlayCircle, Archive } from 'lucide-react';
import { MovieListSidebar } from '../../components/SessionComponents/MovieListSidebar';
import { SessionList } from '../../components/SessionComponents/SessionList';
import { SessionCreateForm } from '../../components/SessionComponents/SessionCreateForm';

interface PagedResult<T> {
    items: T[];
    totalCount: number;
}

const AdminSessions = () => {
    const [halls, setHalls] = useState<HallDto[]>([]);
    const [languages, setLanguages] = useState<LanguageDto[]>([]);

    const [selectedMovie, setSelectedMovie] = useState<MovieDto | null>(null);
    const [loadingSessions, setLoadingSessions] = useState(false);
    const [deleteModal, setDeleteModal] = useState({ isOpen: false });

    // --- STATES ---
    const [allSessions, setAllSessions] = useState<SessionDto[]>([]);
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [sessionToEdit, setSessionToEdit] = useState<SessionDto | null>(null);

    // Вкладки: 'active' | 'past'
    const [activeTab, setActiveTab] = useState<'active' | 'past'>('active');

    // Пагінація
    const [currentPage, setCurrentPage] = useState(1);
    const PAGE_SIZE = 9;

    // Фільтри дат
    const [filterDates, setFilterDates] = useState<{ from: string, to: string, weekdays: number[] }>({
        from: '', to: '', weekdays: []
    });

    useEffect(() => {
        const loadDicts = async () => {
            try {
                const [hRes, lRes] = await Promise.all([HallService.getAll(), LanguageService.getAll()]);
                const hallsData = Array.isArray(hRes) ? hRes : (hRes as unknown as PagedResult<HallDto>).items;
                const langsData = Array.isArray(lRes) ? lRes : (lRes as unknown as PagedResult<LanguageDto>).items;
                setHalls(hallsData);
                setLanguages(langsData);
            } catch (err) {
                console.error(err);
                notify.error("Не вдалося завантажити довідники");
            }
        };
        void loadDicts();
    }, []);

    const fetchSessions = async (movieId: number) => {
        setLoadingSessions(true);
        try {
            const data = await SessionService.getByMovieId(movieId);
            // Сортуємо: нові зверху
            const sorted = data.sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
            setAllSessions(sorted);
            setCurrentPage(1);
            setSelectedIds([]);
        } catch (e) {
            console.error(e);
            notify.error("Помилка завантаження розкладу");
        } finally {
            setLoadingSessions(false);
        }
    };

    useEffect(() => {
        if (selectedMovie) {
            void fetchSessions(selectedMovie.id);
            setSessionToEdit(null);
        } else {
            setAllSessions([]);
        }
    }, [selectedMovie]);

    // --- ФІЛЬТРАЦІЯ (ВКЛАДКИ + ДАТИ) ---
    const filteredSessions = useMemo(() => {
        let result = allSessions;
        const now = new Date();

        if (activeTab === 'active') {
            result = result.filter(s => new Date(s.endTime) > now);
        } else {
            result = result.filter(s => new Date(s.endTime) <= now);
        }

        if (filterDates.from) {
            const from = new Date(filterDates.from); from.setHours(0, 0, 0, 0);
            result = result.filter(s => new Date(s.startTime) >= from);
        }
        if (filterDates.to) {
            const to = new Date(filterDates.to); to.setHours(23, 59, 59, 999);
            result = result.filter(s => new Date(s.startTime) <= to);
        }
        if (filterDates.weekdays.length > 0) {
            result = result.filter(s => {
                const day = new Date(s.startTime).getDay();
                return filterDates.weekdays.includes(day);
            });
        }
        return result;
    }, [allSessions, filterDates, activeTab]);

    const paginatedSessions = useMemo(() => {
        const startIndex = (currentPage - 1) * PAGE_SIZE;
        return filteredSessions.slice(startIndex, startIndex + PAGE_SIZE);
    }, [filteredSessions, currentPage]);

    const totalPages = Math.ceil(filteredSessions.length / PAGE_SIZE);

    // --- HANDLERS ---
    const handleToggleSelect = (id: number) => {
        setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
    };

    const handleToggleSelectAll = () => {
        const pageIds = paginatedSessions.map(s => s.id);
        const allSelected = pageIds.every(id => selectedIds.includes(id));
        if (allSelected) {
            setSelectedIds(prev => prev.filter(id => !pageIds.includes(id)));
        } else {
            const newIds = [...selectedIds];
            pageIds.forEach(id => { if (!newIds.includes(id)) newIds.push(id); });
            setSelectedIds(newIds);
        }
    };

    const handleCreateSessions = async (dataList: CreateSessionDto[]) => {
        if (!selectedMovie) return;
        try {
            const promises = dataList.map(item => SessionService.create({
                ...item,
                movieId: selectedMovie.id,
                hallId: Number(item.hallId),
                languageId: Number(item.languageId)
            }));
            await Promise.all(promises);
            notify.success(`Створено сеансів: ${dataList.length}`);
            void fetchSessions(selectedMovie.id);
        } catch (err) {
            console.error(err);
            notify.error('Помилка при створенні');
        }
    };

    const handleUpdateSession = async (id: number, data: CreateSessionDto) => {
        if (!selectedMovie) return;
        try {
            await SessionService.update(id, {
                ...data,
                movieId: selectedMovie.id,
                hallId: Number(data.hallId),
                languageId: Number(data.languageId)
            });
            notify.success("Сеанс оновлено");
            void fetchSessions(selectedMovie.id);
            setSessionToEdit(null);
        } catch (err) {
            console.error(err);
            notify.error("Не вдалося оновити сеанс");
        }
    };

    const confirmDelete = async () => {
        if (selectedIds.length === 0) return;
        try {
            await Promise.all(selectedIds.map(id => SessionService.delete(id)));
            notify.success(`Видалено сеансів: ${selectedIds.length}`);
            setSelectedIds([]);
            if (selectedMovie) await fetchSessions(selectedMovie.id);
        } catch (e) {
            console.error(e);
            notify.error("Помилка при видаленні.");
        } finally {
            setDeleteModal({ isOpen: false });
        }
    };

    return (
        <div className="flex flex-col lg:flex-row gap-8 text-white h-[calc(100vh-140px)] animate-fade-in">
            <MovieListSidebar
                selectedMovieId={selectedMovie?.id}
                onSelectMovie={setSelectedMovie}
            />

            <div className="w-full lg:w-2/3 flex flex-col gap-6">
                {selectedMovie ? (
                    <>
                        <SessionCreateForm
                            movie={selectedMovie}
                            halls={halls}
                            languages={languages}
                            initialData={sessionToEdit}
                            onSubmit={handleCreateSessions}
                            onUpdate={handleUpdateSession}
                            onCancelEdit={() => setSessionToEdit(null)}
                        />

                        {/* ВКЛАДКИ (TABS) */}
                        <div className="flex bg-[#1a1d26] p-1 rounded-2xl w-fit border border-gray-800">
                            <button
                                onClick={() => { setActiveTab('active'); setCurrentPage(1); }}
                                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
                                    activeTab === 'active'
                                        ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/20'
                                        : 'text-gray-400 hover:text-white hover:bg-gray-800'
                                }`}
                            >
                                <PlayCircle size={16} /> Активні
                            </button>
                            <button
                                onClick={() => { setActiveTab('past'); setCurrentPage(1); }}
                                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
                                    activeTab === 'past'
                                        ? 'bg-gray-700 text-white shadow-lg'
                                        : 'text-gray-400 hover:text-white hover:bg-gray-800'
                                }`}
                            >
                                <Archive size={16} /> Минулі
                            </button>
                        </div>

                        <SessionList
                            sessions={paginatedSessions}
                            loading={loadingSessions}

                            selectedIds={selectedIds}
                            onToggleSelect={handleToggleSelect}
                            onToggleSelectAll={handleToggleSelectAll}
                            onDeleteClick={() => setDeleteModal({ isOpen: true })}
                            onEdit={(session) => {
                                setSessionToEdit(session);
                                window.scrollTo({ top: 0, behavior: 'smooth' });
                            }}

                            totalCount={filteredSessions.length}
                            currentPage={currentPage}
                            totalPages={totalPages}
                            pageSize={PAGE_SIZE}
                            onPageChange={(p) => setCurrentPage(p)}
                            onFilterChange={(from, to, weekdays) => {
                                setFilterDates({ from, to, weekdays });
                                setCurrentPage(1);
                            }}
                        />
                    </>
                ) : (
                    <div className="bg-[#1a1d26] p-10 rounded-4xl border border-gray-800 border-dashed flex flex-col items-center justify-center text-gray-500 h-full opacity-70">
                        <Film size={60} className="mb-4 opacity-20" />
                        <p className="font-bold text-lg">Оберіть фільм зі списку</p>
                        <p className="text-sm">щоб налаштувати розклад сеансів</p>
                    </div>
                )}
            </div>

            <ConfirmModal
                isOpen={deleteModal.isOpen}
                title={`Видалити ${selectedIds.length} сеанс(ів)?`}
                description={<p className="text-white">Квитки на ці сеанси стануть недійсними.</p>}
                onConfirm={() => void confirmDelete()}
                onClose={() => setDeleteModal({ isOpen: false })}
                variant="danger"
                confirmText="Видалити"
            />
        </div>
    );
};

export default AdminSessions;