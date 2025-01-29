import { formatNumber } from '~/utils/formatters';

interface ProgressBarProps {
    value: number;
    total: number;
    label: string;
    color?: "blue" | "green" | "yellow" | "red";
}

export function ProgressBar({ value, total, label, color = "blue" }: ProgressBarProps) {
    const percentageRaw = isNaN(value / total) ? 0 : (value / total) * 100;
    const percentage = Math.round(percentageRaw);
    const colors = {
        blue: "bg-blue-600",
        green: "bg-green-600",
        yellow: "bg-yellow-600",
        red: "bg-red-600"
    }

    return (
        <div className="space-y-2">
            <div className="flex justify-between text-sm">
                <span>{label}</span>
                <span>{percentage}%</span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full">
                <div 
                    className={`h-full rounded-full ${colors[color]}`}
                    style={{ width: `${percentageRaw}%` }}
                />
            </div>
            <div className="flex justify-between text-xs text-gray-500">
                <span>{formatNumber(value)}</span>
                <span>{formatNumber(total)}</span>
            </div>
        </div>
    );
} 