export const formatDateWithYear = (dateStr?: string) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('uk-UA', {
        day: 'numeric', month: 'long', year: 'numeric'
    });
};

export const formatDateWithoutYear = (dateStr?: string) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('uk-UA', { day: 'numeric', month: 'long' });
};

export const formatTime = (s: string) =>
    new Date(s).toLocaleTimeString('uk-UA', { hour: '2-digit', minute: '2-digit' });