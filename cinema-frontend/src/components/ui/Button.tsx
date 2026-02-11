import React, {type ButtonHTMLAttributes, type ReactNode } from 'react';
import { Loader2 } from 'lucide-react';

// Визначаємо інтерфейс для пропсів
interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'glass';
    isLoading?: boolean;
    icon?: ReactNode;
}

// Використовуємо React.FC для типізації компонента
export const Button: React.FC<ButtonProps> = ({
                                                  children,
                                                  variant = 'primary',
                                                  isLoading,
                                                  className = '',
                                                  icon,
                                                  ...props
                                              }) => {

    // Базові стилі для всіх кнопок
    const baseStyles = "relative group flex items-center justify-center gap-2 px-6 py-3 md:px-8 md:py-3.5 rounded-xl font-bold tracking-wide transition-all duration-300 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden text-sm md:text-base";

    // Об'єкт зі стилями для різних варіантів
    const variants = {
        primary: "bg-gradient-to-r from-red-600 to-red-700 text-white shadow-[0_0_20px_rgba(220,38,38,0.3)] hover:shadow-[0_0_30px_rgba(220,38,38,0.5)] hover:brightness-110 border border-transparent",
        secondary: "bg-[#1a1d26] text-gray-300 hover:text-white hover:bg-[#252a36] border border-white/10 hover:border-white/30",
        glass: "bg-white/10 backdrop-blur-md border border-white/10 text-white hover:bg-white/20 hover:border-white/30 shadow-lg"
    };

    return (
        <button
            className={`${baseStyles} ${variants[variant]} ${className}`}
            disabled={isLoading || props.disabled}
            {...props}
        >
            {/* Анімація блику для варіанту Primary */}
            {variant === 'primary' && !isLoading && (
                <div className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent z-0 pointer-events-none" />
            )}

            <span className="relative z-10 flex items-center gap-2">
                {isLoading ? (
                    <>
                        <Loader2 className="animate-spin" size={20} />
                        <span>Зачекайте...</span>
                    </>
                ) : (
                    <>
                        {icon && <span className="transition-transform group-hover:scale-110">{icon}</span>}
                        {children}
                    </>
                )}
            </span>
        </button>
    );
};