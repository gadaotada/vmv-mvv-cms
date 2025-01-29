import { isValidElement, Children, useState, useEffect, cloneElement, useCallback, memo } from "react";
import { cn } from "~/utils/global";

/* 
example usage: 

<TabsController onTabChange={callback()} onTabOpen={callback()} onTabClose={callback()} >
    <Tab label="System">
        {children}
    </Tab>
    <Tab label="Database" className="bg-red-500">
        {children}
    </Tab>
    <Tab label="Logs">
        {children}
    </Tab>
</TabsController>

*/

type TabProps = {
    children: React.ReactNode;
    label: string;
    className?: string;
    onTabClose?: (tab: string) => void;
}

interface TabsControllerProps {
    children: React.ReactNode;
    className?: string;
    onTabOpen?: (tab: string) => void;
    onTabClose?: (tab: string) => void;
}

// Memoize the Tab component
export const Tab = memo(({ children, label, className, onTabClose }: TabProps) => {
    useEffect(() => {
        return () => {
            onTabClose?.(label);
        }
    }, [onTabClose, label]);

    return <div className={cn("w-full", className)}>{children}</div>;
});

Tab.displayName = 'Tab';

export function TabsController({ children, className, onTabOpen, onTabClose }: TabsControllerProps) {
    // Memoize tabs array to prevent unnecessary re-filtering
    const tabs = Children.toArray(children).filter((child) => 
        isValidElement(child) && child.type === Tab
    );

    const [activeTab, setActiveTab] = useState<string>(
        (tabs[0] as React.ReactElement<TabProps>)?.props.label || ''
    );

    // Memoize handlers to prevent unnecessary re-renders
    const handleTabOpen = useCallback((tab: string) => {
        setActiveTab(tab);
        onTabOpen?.(tab);
    }, [onTabOpen]);

    const createTabCloseHandler = useCallback((label: string) => {
        return () => onTabClose?.(label);
    }, [onTabClose]);

    // Memoize tab elements with close handlers
    const tabsWithClose = tabs.map((tab) => {
        const element = tab as React.ReactElement<TabProps>;
        return cloneElement(element, {
            onTabClose: createTabCloseHandler(element.props.label)
        });
    });

    // Memoize tab header button
    const TabButton = memo(({ element, isActive }: { 
        element: React.ReactElement<TabProps>, 
        isActive: boolean 
    }) => (
        <button
            key={element.props.label}
            onClick={() => handleTabOpen(element.props.label)}
            className={cn(
                "px-4 py-2 -mb-px text-sm font-medium transition-colors",
                "hover:text-gray-700 hover:bg-gray-50",
                isActive
                    ? "border-b-2 border-blue-500 text-blue-600"
                    : "text-gray-500"
            )}
        >
            {element.props.label}
        </button>
    ));

    TabButton.displayName = 'TabButton';

    return (
        <div className={cn("flex flex-col items-start", className)}>
            {/* Tab Headers */}
            <div className="flex justify-center items-center gap-8 w-full">
                {tabsWithClose.map((tab) => {
                    const element = tab as React.ReactElement<TabProps>;
                    return (
                        <TabButton 
                            key={element.props.label}
                            element={element}
                            isActive={element.props.label === activeTab}
                        />
                    );
                })}
            </div>

            {/* Tab Content */}
            <div className="mt-4 w-full">
                {tabsWithClose.map((tab) => {
                    const element = tab as React.ReactElement<TabProps>;
                    if (element.props.label !== activeTab) return null;
                    return (
                        <div key={element.props.label} className="w-full">
                            {element.props.children}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
