import { useForm } from 'react-hook-form';
import { Loader2, type LucideIcon } from 'lucide-react';
import { FormInput } from './Form/FormSection';

interface FieldConfig {
    name: string;
    label: string;
    placeholder?: string;
    type?: string;
    icon?: LucideIcon;
    required?: boolean;
}

interface Props {
    title: string;
    buttonText: string;
    icon: LucideIcon;
    fields: FieldConfig[];
    loading: boolean;
    onSubmit: (data: any) => Promise<void>;
}

export const CreateCard = ({
                               title,
                               buttonText,
                               icon: Icon, // Перейменовуємо в Icon для використання як компонента
                               fields,
                               loading,
                               onSubmit
                           }: Props) => {
    const { register, handleSubmit, reset } = useForm();

    const handleFormSubmit = async (data: any) => {
        await onSubmit(data);
        reset();
    };

    return (
        <div className="w-full lg:w-1/3 lg:sticky lg:top-0 bg-[#1a1d26] p-8 rounded-4xl border border-gray-800 shadow-2xl">
            <div className="flex items-center gap-3 mb-8">
                <div className="bg-red-600/20 p-2 rounded-lg">
                    {/* ВИПРАВЛЕНО: Використовуємо передану іконку замість Plus */}
                    <Icon className="text-red-600" size={24} />
                </div>
                <h2 className="text-xl font-black tracking-tight uppercase">{title}</h2>
            </div>

            {/* Динамічна форма */}
            <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-5">
                {fields.map((field) => (
                    <FormInput
                        key={field.name}
                        label={field.label}
                        placeholder={field.placeholder}
                        type={field.type || 'text'}
                        icon={field.icon}
                        {...register(field.name, { required: field.required ?? true })}
                    />
                ))}

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-red-600 hover:bg-red-700 text-white font-black py-4 rounded-2xl transition-all shadow-lg shadow-red-600/20 disabled:opacity-50 uppercase tracking-widest text-xs mt-4 flex items-center justify-center gap-2"
                >
                    {loading ? (
                        <Loader2 className="animate-spin" size={18} />
                    ) : (
                        <>
                            {/* ТУТ ТАКОЖ МОЖНА ЗАМІНИТИ Plus на Icon, якщо хочете однакові іконки */}
                            <Icon size={16} />
                            {buttonText}
                        </>
                    )}
                </button>
            </form>
        </div>
    );
};