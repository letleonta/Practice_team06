import {Search} from "lucide-react";

export const SearchHeader = ({ label, searchValue, onSearchChange, onAddClick, accentColor }: any) => (
    <div className="flex justify-between items-end gap-4 mb-6">
        <div className="flex-1">
            <label className="text-[10px] text-gray-500 font-black uppercase mb-3 block tracking-widest">{label}</label>
            <div className="relative">
                <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600"/>
                <input
                    type="text"
                    placeholder="Пошук..."
                    value={searchValue}
                    onChange={onSearchChange}
                    className={`w-full bg-gray-900 border border-gray-700 pl-12 pr-4 py-4 rounded-2xl text-xs outline-none focus:border-${accentColor} text-white font-bold shadow-inner`}
                />
            </div>
        </div>
        <button
            type="button"
            onClick={onAddClick}
            className={`text-[10px] bg-${accentColor} text-white px-6 py-4 rounded-2xl font-black hover:opacity-80 transition-all`}
        >
            + Додати
        </button>
    </div>
);