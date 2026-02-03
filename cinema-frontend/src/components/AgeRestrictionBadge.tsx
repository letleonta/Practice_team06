import {getAgeRestrictionText} from "../utils/formatAgeRestriction.ts";

interface Props {
    restriction?: string;
    className?: string;
}

export const AgeRestrictionBadge = ({ restriction, className = "" }: Props) => {
    if (!restriction) return null;

    return (
        <div className={`bg-red-600 text-white font-bold px-2.5 py-1 rounded-lg text-xs shadow-lg ${className}`}>
            {getAgeRestrictionText(restriction)}
        </div>
    );
};