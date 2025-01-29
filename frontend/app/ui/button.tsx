import { cn } from "~/utils/global";

type ButtonVariant =  keyof typeof variantValues;

const variantValues = {
    "primary":"text-white bg-blue-700 hover:bg-blue-800 focus:ring-1 focus:outline-none focus:ring-blue-300 font-medium text-sm w-full sm:w-auto px-4 py-2.5 text-center",
    "ghost":"text-gray-700 bg-transparent hover:bg-gray-100 focus:ring-1 focus:ring-gray-300 font-medium text-sm px-4 py-2.5 text-center",
    "destructive":"text-white bg-red-600 hover:bg-red-700 focus:ring-1 focus:outline-none focus:ring-red-300 font-medium text-sm w-full sm:w-auto px-4 py-2.5 text-center",
    "empty":""
}

interface ButtonProps extends React.HTMLProps<HTMLButtonElement> {
    variant?: ButtonVariant
    type?: "button" | "submit"
    children: React.ReactNode;
    className?: string
}

export function Button({variant = "empty", type = "button", children, className, ...rest}: ButtonProps) {

    return (
        <button
            {...rest}
            type={type}
            className={cn(variantValues[variant], className)}
        >
            {children}
        </button>
    )
}