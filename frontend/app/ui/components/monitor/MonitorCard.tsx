import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { EyeIcon, EyeClosed, GripVerticalIcon } from 'lucide-react';

interface MonitorCardProps {
    id: string;
    title: string;
    children: React.ReactNode;
    onVisibilityToggle: (id: string) => void;
    isVisible: boolean;
    customWidth?: string;
}

export function MonitorCard({ id, title, children, onVisibilityToggle, isVisible, customWidth = '' }: MonitorCardProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
    } = useSortable({ id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    if (!isVisible) return null;

    return (
        <div 
            ref={setNodeRef} 
            style={style}
            className={`bg-white p-6 rounded-xl shadow-sm relative group ${customWidth ? customWidth : ''}`}
        >
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                    onClick={() => onVisibilityToggle(id)}
                    className="p-1 hover:bg-gray-100 rounded-full"
                >
                    {isVisible ? (
                        <EyeIcon className="w-5 h-5 text-gray-500" />
                    ) : (
                        <EyeClosed className="w-5 h-5 text-gray-500" />
                    )}
                </button>
                <button
                    {...attributes}
                    {...listeners}
                    className="p-1 hover:bg-gray-100 rounded-full ml-1 cursor-move"
                >
                    <GripVerticalIcon className="w-5 h-5 text-gray-500" />
                </button>
            </div>
            <h3 className="text-lg font-semibold mb-4">{title}</h3>
            {children}
        </div>
    );
}