import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminService } from '../services/adminService';
import { movieService } from '../services/movieService';
import { actorService } from '../services/actorService';
import type { DirectorDto } from '../types/director';
import type { GenreDto } from '../types/genre';
import type { ActorDto } from '../types/actor';

export function AddMoviePage() {
    const navigate = useNavigate();

    // Списки для вибору
    const [directors, setDirectors] = useState<DirectorDto[]>([]);
    const [genres, setGenres] = useState<GenreDto[]>([]);
    const [actors, setActors] = useState<ActorDto[]>([]);

    // Поля форми (відповідають твоєму CreateMovieDto)
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        durationMin: 120,
        basePrice: 150,
        releaseDate: '',
        startDate: '',
        endDate: '',
        posterUri: '',
        trailerUri: '',
        ageRestriction: 0, // 0 = 0+, 1 = 12+, 2 = 16+, 3 = 18+
        directorId: 0,
        genreIds: [] as number[],
        actorIds: [] as number[]
    });

    useEffect(() => {
        // Завантажуємо всі дані для випадаючих списків
        const loadFormData = async () => {
            try {
                const [d, g, a] = await Promise.all([
                    adminService.getDirectors(),
                    adminService.getGenres(),
                    actorService.getAll()
                ]);
                setDirectors(d);
                setGenres(g);
                setActors(a);
            } catch (err) {
                console.error("Помилка завантаження даних для форми", err);
            }
        };
        loadFormData();
    }, []);

    const handleGenreChange = (id: number) => {
        setFormData(prev => ({
            ...prev,
            genreIds: prev.genreIds.includes(id)
                ? prev.genreIds.filter(gId => gId !== id)
                : [...prev.genreIds, id]
        }));
    };

    const handleActorChange = (id: number) => {
        setFormData(prev => ({
            ...prev,
            actorIds: prev.actorIds.includes(id)
                ? prev.actorIds.filter(aId => aId !== id)
                : [...prev.actorIds, id]
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Валідація: чи обрано режисера
        if (formData.directorId === 0) {
            alert("Будь ласка, оберіть режисера");
            return;
        }

        try {
            await movieService.create(formData as any); // as any тимчасово для збігу типів
            alert("Фільм успішно додано!");
            navigate('/admin/movies');
        } catch (err) {
            console.error(err);
            alert("Помилка при створенні фільму. Перевірте консоль.");
        }
    };

    return (
        <div className="admin-form-container">
            <button onClick={() => navigate(-1)} className="back-btn">← Назад</button>
            <h2 className="section-title">Додати новий фільм</h2>

            <form onSubmit={handleSubmit} className="admin-form">
                <div className="form-group">
                    <label>Назва фільму</label>
                    <input type="text" required value={formData.title}
                           onChange={e => setFormData({...formData, title: e.target.value})} />
                </div>

                <div className="form-group">
                    <label>Опис</label>
                    <textarea required value={formData.description}
                              onChange={e => setFormData({...formData, description: e.target.value})} />
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <label>Ціна (грн)</label>
                        <input type="number" value={formData.basePrice}
                               onChange={e => setFormData({...formData, basePrice: +e.target.value})} />
                    </div>
                    <div className="form-group">
                        <label>Тривалість (хв)</label>
                        <input type="number" value={formData.durationMin}
                               onChange={e => setFormData({...formData, durationMin: +e.target.value})} />
                    </div>
                    <div className="form-group">
                        <label>Вікове обмеження</label>
                        <select value={formData.ageRestriction}
                                onChange={e => setFormData({...formData, ageRestriction: +e.target.value})}>
                            <option value={0}>0+</option>
                            <option value={1}>12+</option>
                            <option value={2}>16+</option>
                            <option value={3}>18+</option>
                        </select>
                    </div>
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <label>Дата виходу</label>
                        <input type="date" required onChange={e => setFormData({...formData, releaseDate: e.target.value})} />
                    </div>
                    <div className="form-group">
                        <label>Початок прокату</label>
                        <input type="date" required onChange={e => setFormData({...formData, startDate: e.target.value})} />
                    </div>
                    <div className="form-group">
                        <label>Кінець прокату</label>
                        <input type="date" required onChange={e => setFormData({...formData, endDate: e.target.value})} />
                    </div>
                </div>

                <div className="form-group">
                    <label>URL Постера</label>
                    <input type="url" placeholder="https://..." onChange={e => setFormData({...formData, posterUri: e.target.value})} />
                </div>

                <div className="form-group">
                    <label>Режисер</label>
                    <select required value={formData.directorId}
                            onChange={e => setFormData({...formData, directorId: +e.target.value})}>
                        <option value={0}>Оберіть режисера</option>
                        {directors.map(d => (
                            <option key={d.id} value={d.id}>{d.firstName} {d.lastName}</option>
                        ))}
                    </select>
                </div>

                <div className="form-row selections">
                    <div className="form-group">
                        <label>Жанри</label>
                        <div className="checkbox-grid">
                            {genres.map(g => (
                                <label key={g.id} className="checkbox-item">
                                    <input type="checkbox" checked={formData.genreIds.includes(g.id)}
                                           onChange={() => handleGenreChange(g.id)} />
                                    {g.name}
                                </label>
                            ))}
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Актори</label>
                        <div className="checkbox-grid">
                            {actors.map(a => (
                                <label key={a.id} className="checkbox-item">
                                    <input type="checkbox" checked={formData.actorIds.includes(a.id)}
                                           onChange={() => handleActorChange(a.id)} />
                                    {a.firstName} {a.lastName}
                                </label>
                            ))}
                        </div>
                    </div>
                </div>

                <button type="submit" className="details-btn" style={{width: '100%', marginTop: '20px'}}>
                    Створити фільм
                </button>
            </form>
        </div>
    );
}

export default AddMoviePage;