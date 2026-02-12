import {getAgeRestrictionText} from "../../utils/formatAgeRestriction.ts";

interface Props {
    restriction?: string;
    className?: string;
}

export const AgeRestrictionBadge = ({ restriction, className = "" }: Props) => {
    if (!restriction) return null;

    return (
        <div className={`
            bg-red-600/50 text-white font-bold 
            px-2.5 py-1 rounded-full text-xs 
            shadow-lg border border-red-950
            backdrop-blur-sm
            ${className}
        `}>
            {getAgeRestrictionText(restriction)}
        </div>
    );
};