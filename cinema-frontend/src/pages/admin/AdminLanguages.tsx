import { useEffect, useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { LanguageService } from '../../services/language.service.ts';
import type { LanguageDto, CreateLanguageDto } from '../../types/language';
import { Globe, Plus, Search, Trash2 } from 'lucide-react';

const AdminLanguages = () => {
    const { register, handleSubmit, reset } = useForm<CreateLanguageDto>();
    const [languages, setLanguages] = useState<LanguageDto[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(false);

    const loadData = async () => {
        try {
            const data = await LanguageService.getAll();
            setLanguages(data);
        } catch (err) { console.error(err); }
    };

    useEffect(() => { loadData(); }, []);

    const onSubmit = async (data: CreateLanguageDto) => {
        setLoading(true);
        try {
            await LanguageService.create(data);
            reset();
            loadData();
        } catch (err) { alert("Помилка додавання"); }
        finally { setLoading(false); }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Видалити цю мову?')) return;
        try {
            await LanguageService.delete(id);
            loadData();
        } catch (err) { alert("Помилка видалення"); }
    };

    const filteredLanguages = useMemo(() =>
            languages.filter(l => l.name.toLowerCase().includes(searchTerm.toLowerCase()))
        , [languages, searchTerm]);

    return (
        <div className="flex flex-col lg:flex-row gap-8 items-start text-white">
            <div className="w-full lg:w-1/3 bg-[#1a1d26] p-8 rounded-[32px] border border-gray-800 shadow-2xl">
                <h2 className="text-xl font-black mb-6 flex items-center gap-3 text-red-500 uppercase italic"><Plus size={24} /> Нова мова</h2>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <input {...register('name', { required: true })} className="w-full p-4 bg-gray-900 border border-gray-700 rounded-2xl outline-none focus:border-red-500 text-white" placeholder="Напр. Українська" />
                    <button disabled={loading} className="w-full bg-red-600 hover:bg-red-700 text-white py-4 rounded-2xl font-black uppercase transition-all shadow-lg shadow-red-600/20 active:scale-95">
                        {loading ? '...' : 'ЗБЕРЕГТИ'}
                    </button>
                </form>
            </div>

            <div className="w-full lg:w-2/3 bg-[#1a1d26] rounded-[32px] border border-gray-800 shadow-2xl overflow-hidden flex flex-col min-h-[500px]">
                <div className="p-8 border-b border-gray-800 bg-gray-900/30 flex justify-between items-center gap-4">
                    <h2 className="font-black flex items-center gap-3 text-xl uppercase tracking-tighter italic"><Globe className="text-red-600" size={24} /> Мови</h2>
                    <div className="relative w-64">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                        <input type="text" placeholder="Пошук..." onChange={(e) => setSearchTerm(e.target.value)} className="w-full bg-gray-900 border border-gray-700 rounded-xl py-2.5 pl-11 outline-none focus:border-red-500 text-sm transition-all" />
                    </div>
                </div>
                <div className="p-6 space-y-3 overflow-y-auto flex-1">
                    {filteredLanguages.map(l => (
                        <div key={l.id} className="flex justify-between items-center bg-gray-900/50 p-4 rounded-2xl border border-gray-800 group hover:bg-gray-900 transition-all">
                            <span className="font-bold uppercase tracking-wider text-sm">{l.name}</span>
                            <button onClick={() => handleDelete(l.id)} className="p-2 text-gray-600 hover:text-red-500 transition-all opacity-0 group-hover:opacity-100"><Trash2 size={18}/></button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default AdminLanguages;