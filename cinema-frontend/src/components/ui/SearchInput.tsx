import React from 'react';
import { Search } from 'lucide-react';

interface SearchInputProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    className?: string; // Дозволимо додавати зовнішні відступи, якщо треба
}

export const SearchInput: React.FC<SearchInputProps> = ({
                                                            value,
                                                            onChange,
                                                            placeholder = "Пошук...",
                                                            className = ""
                                                        }) => {
    return (
        <div className={`relative ${className}`}>
            <Search
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"
            />
            <input
                type="text"
                placeholder={placeholder}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="w-full pl-12 pr-10 py-3.5 rounded-2xl bg-[#1a1d26] border border-gray-800 text-sm focus:border-red-600 outline-none transition-all shadow-xl text-white font-sans"
            />
        </div>
    );
};