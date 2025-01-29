import { Menu } from 'lucide-react';

interface CardManagerProps {
    cardOrder: string[];
    hiddenCards: string[];
    onToggleVisibility: (cardId: string) => void;
}

export function CardManager({ cardOrder, hiddenCards, onToggleVisibility }: CardManagerProps) {
    return (
        <div className="group absolute right-0 top-0 z-40 flex flex-col items-end">
            <button className="flex items-center gap-2 px-3 py-1 text-sm rounded-lg hover:bg-gray-50">
                <Menu className="w-4 h-4" />
            </button>
            <div className="mt-1 bg-white rounded-lg shadow-lg border p-2 min-w-[200px] hidden group-hover:block">
                {cardOrder.map(cardId => (
                    <label 
                        key={cardId} 
                        className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 rounded cursor-pointer"
                    >
                    <input
                        type="checkbox"
                        checked={!hiddenCards.includes(cardId)}
                        onChange={() => onToggleVisibility(cardId)}
                        className="rounded border-gray-300"
                    />
                    <span className="capitalize">{cardId}</span>
                    </label>
                ))}
            </div>     
        </div>
    );
}