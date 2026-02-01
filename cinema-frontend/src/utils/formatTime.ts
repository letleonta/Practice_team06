export const formatDate = (s: string) =>
    new Date(s).toLocaleDateString('uk-UA', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    });

export const formatTime = (s: string) =>
    new Date(s).toLocaleTimeString('uk-UA', { hour: '2-digit', minute: '2-digit' });