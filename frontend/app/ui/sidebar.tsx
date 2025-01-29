import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router";
import { ArrowLeft, ArrowRight, LayoutDashboard, Monitor, Settings } from "lucide-react";

import { cn } from "~/utils/global";
import { Button } from "./button";
import { useDefaultUIvals } from "~/providers/DefaultUIvals";
import Logout from "~/features/sign/logout";
import { useAuth } from "~/providers/AuthProvider";

const sidebarItems = [
    {
        id: 1,
        name: "Табло",
        path: "/dashboard",
        icon: <LayoutDashboard />,
        isNested: false
    },
    {
        id: 2,
        name: "Настройки",
        path: "/dashboard/settings",
        icon: <Settings />,
        isNested: false
    },
    {
        id: 3,
        name: "Мониторинг",
        path: "/dashboard/monitor",
        icon: <Monitor />,
        isNested: false
    }
];

function isPathActive(currentPath: string, path: string, nested: boolean = false) {
    if (nested) {
        return currentPath.length > path.length && currentPath.includes(path);
    } else {
        return currentPath === path;
    }
}

export function SideBar() {
    const { values, updateSettings } = useDefaultUIvals();
    const { pathname } = useLocation();
    const { isAuthenticated } = useAuth(); 
    const [isExpanded, setIsExpanded] = useState(values.sidebarToggled);

    useEffect(() => {
        // fix for moving from small to wide glitching
        const timeout = setTimeout(() => {
            setIsExpanded(values.sidebarToggled);
        }, 100);

        return () => clearTimeout(timeout);
    }, [values.sidebarToggled]);

    return (
        <aside
            className={cn(
                "min-w-52 border-r min-h-[100vh] border-gray-200 shadow flex flex-col justify-start items-center gap-8 p-2 relative transition-all duration-200",
                values.sidebarToggled && "min-w-14 w-14"
            )}>
                <Button
                    className="absolute top-[50%] -right-3 font-extralight w-7 border border-gray-200 p-0 bg-white"
                    variant="ghost"
                    onClick={() => updateSettings({ sidebarToggled: !values.sidebarToggled })}
                >
                    {values.sidebarToggled ? <ArrowRight /> : <ArrowLeft />}
                </Button>
                {/* items/routes */}
                {sidebarItems.map((item) => 
                    <Link
                        key={item.id}
                        to={isAuthenticated ? item.path : "/"}
                        replace={true}
                        className={cn(
                            "border border-gray-200 p-2 text-center flex justify-start items-center w-full gap-2",
                            isPathActive(pathname, item.path, item.isNested) ? "border-blue-500 text-blue-500" : ""
                        )}
                    >
                        {values.sidebarToggled 
                            ? item.icon 
                            : (
                                <>
                                    {item.icon}
                                    {!isExpanded && <span>{item.name}</span>}
                                </>
                              )
                        }
                    </Link>
                )}
                <Logout wide={!values.sidebarToggled} />
        </aside>
    );
}
