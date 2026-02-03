import toast from 'react-hot-toast';

const toastStyle = {
    borderRadius: '20px',
    background: '#1a1d26',
    color: '#fff',
    border: '1px solid #374151',
    padding: '16px',
    fontWeight: '600',
    fontSize: '14px',
    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.4)',
};

export const notify = {
    success: (message: string) =>
        toast.success(message, {
            style: toastStyle,
            iconTheme: {
                primary: '#ef4444', // Твій червоний
                secondary: '#fff',
            },
        }),

    error: (message: string) =>
        toast.error(message, {
            style: toastStyle,
            iconTheme: {
                primary: '#ef4444',
                secondary: '#fff',
            },
        }),

    loading: (message: string) =>
        toast.loading(message, {
            style: toastStyle,
        }),
};