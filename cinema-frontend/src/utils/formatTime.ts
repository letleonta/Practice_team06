const parseDate = (dateStr?: string, useUTC: boolean = false): Date | null => {
    if (!dateStr) return null;

    let normalized = dateStr;
    // Якщо useUTC true, і рядок не має Z або офсету (+), додаємо Z
    if (useUTC && !dateStr.endsWith('Z') && !dateStr.includes('+')) {
        normalized = `${dateStr}Z`;
    }

    const date = new Date(normalized);
    return isNaN(date.getTime()) ? null : date;
};

export const formatDateWithYear = (dateStr?: string, useUTC: boolean = false) => {
    const date = parseDate(dateStr, useUTC);
    return date ? date.toLocaleDateString('uk-UA', {
        day: 'numeric', month: 'long', year: 'numeric'
    }) : '';
};

export const formatDateWithoutYear = (dateStr?: string, useUTC: boolean = false) => {
    const date = parseDate(dateStr, useUTC);
    return date ? date.toLocaleDateString('uk-UA', {
        day: 'numeric', month: 'long'
    }) : '';
};

export const formatDateShortWithYear = (dateStr?: string, useUTC: boolean = false) => {
    const date = parseDate(dateStr, useUTC);
    return date ? date.toLocaleDateString('uk-UA', {
        day: 'numeric', month: 'numeric', year: 'numeric'
    }) : '';
};

export const formatDateShortWithoutYear = (dateStr?: string, useUTC: boolean = false) => {
    const date = parseDate(dateStr, useUTC);
    return date ? date.toLocaleDateString('uk-UA', {
        day: 'numeric', month: 'numeric'
    }) : '';
};

export const formatTime = (s?: string, useUTC: boolean = false) => {
    const date = parseDate(s, useUTC);
    return date ? date.toLocaleTimeString('uk-UA', {
        hour: '2-digit', minute: '2-digit'
    }) : '';
};