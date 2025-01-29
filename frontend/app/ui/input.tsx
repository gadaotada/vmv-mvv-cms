import { cn } from "~/utils/global";

interface InputProps extends React.HTMLProps<HTMLInputElement> {
    name: string
    placeholder: string
    className?: string
}

export function Input({name, placeholder, className = "", ...rest}: InputProps) {

    return (
        <input 
            {...rest}
            placeholder={placeholder}
            name={name}
            className={cn("bg-gray-50 border border-gray-300 text-gray-900 text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 outline-none focus:outline-none", className)}
        />
    )
}