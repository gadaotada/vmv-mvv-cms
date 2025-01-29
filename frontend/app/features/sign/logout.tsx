import { useState } from "react";
import { Undo2 } from "lucide-react";

import { useAuth } from "~/providers/AuthProvider";
import { Button } from "~/ui/button";
import { cn } from "~/utils/global";

export default function Logout({ wide = false }: { wide: boolean }) {
    const [loading, setLoading] = useState<boolean>(false);
    const { logout } = useAuth();

    const handleLogout = async () => {
        if (loading) {
            return;
        }
        setLoading(true);
        try {
            const res = await logout();
            if (res) {
                window.history.pushState(null, '', '/');
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }

    return (
        <Button 
            variant="ghost" 
            onClick={handleLogout} 
            disabled={loading}
            className={cn(
                "flex justify-center items-center gap-2 mt-auto mb-4",
                wide ? "w-full" : ""
            )}
        >
            {wide ? <span>Изход</span> : <Undo2 />}
        </Button>
    )
}