export const getSeatTypeColor = (type: string, isAvailable: boolean, isSelected: boolean) => {
    if (!isAvailable) return 'bg-gray-800 border-gray-800 text-gray-700 cursor-not-allowed';
    if (isSelected) return 'bg-red-600 border-red-500 text-white shadow-md shadow-red-600/30 scale-110 cursor-pointer';

    switch (type?.toLowerCase()) {
        case 'vip':
            return 'bg-yellow-900/40 border-yellow-600/50 text-yellow-300 hover:bg-yellow-800/60 hover:border-yellow-500 cursor-pointer';
        case 'premium':
            return 'bg-purple-900/40 border-purple-600/50 text-purple-300 hover:bg-purple-800/60 hover:border-purple-500 cursor-pointer';
        default: // standard
            return 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600 hover:border-red-600/60 hover:text-white cursor-pointer';
    }
};

export const getSeatTypeLabelColor = (type: string) => {
    switch (type?.toLowerCase()) {
        case 'vip':       return 'bg-yellow-900/30 border-yellow-600/40 text-yellow-400';
        case 'premium':   return 'bg-purple-900/30 border-purple-600/40 text-purple-400';
        default:          return 'bg-gray-700/50 border-gray-600/40 text-gray-400';
    }
};