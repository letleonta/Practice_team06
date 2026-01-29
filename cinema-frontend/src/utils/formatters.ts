// src/utils/formatters.ts

export const formatAge = (age: string | undefined): string => {
    if (!age) return '';

    const ageMap: Record<string, string> = {
        'ZeroPlus': '0+',
        'TwelvePlus': '12+',
        'SixteenPlus': '16+',
        'EighteenPlus': '18+'
    };

    // Якщо в базі назва трохи інша (наприклад Age12), підправ ключі вище
    return ageMap[age] || age;
};