export const getAgeRestrictionText = (ageRestriction: string) => {
    const statusMap: { [key: string]: string } = {
        'ZeroPlus': '0+',
        'TwelvePlus': '12+',
        'SixteenPlus': '16+',
        'EighteenPlus': '18+'
    };
    return statusMap[ageRestriction] || ageRestriction;
};