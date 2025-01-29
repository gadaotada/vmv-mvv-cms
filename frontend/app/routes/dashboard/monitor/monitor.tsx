import { useState } from "react";

import { TabsController, Tab } from "~/ui/tabs";
import SystemPage from "./system";
import DatabasePage from "./database";
import { useDefaultUIvals } from "~/providers/DefaultUIvals";
import { getCurrentSettingsPerTab } from "./helper";
import { CardManager } from "~/ui/components/monitor/CardManager";
type View = "System" | "Database" | "Logs";

export default function Monitor() {
    const [activeView, setActiveView] = useState<View>("System");
    const { values, updateSettings } = useDefaultUIvals();

    const currentSettings = getCurrentSettingsPerTab(values, activeView);

    const handleToggleVisibility = (cardId: string) => {
        if (!currentSettings) return;

        const hiddenCards = [...currentSettings.hiddenCards];
        const index = hiddenCards.indexOf(cardId);
        const currentName = activeView.toLowerCase() + "Monitor";
        if (index === -1) {
            hiddenCards.push(cardId);
        } else {
            hiddenCards.splice(index, 1);
        }
        
        updateSettings({
            [currentName]: {
                ...currentSettings,
                hiddenCards: hiddenCards
            }
        });
    }

    const handleTabOpen = (tab: string) => {
        setActiveView(tab as View);
    };

    const handleTabClose = (tab: string) => {
        console.log(`Tab ${tab} closed`);
    };

    return (
        <div className="flex justify-center items-start h-full w-full p-2">
            {currentSettings && (
                <CardManager 
                    cardOrder={currentSettings.cardOrder}
                    hiddenCards={currentSettings.hiddenCards}
                    onToggleVisibility={handleToggleVisibility}
                />
            )}
            <TabsController 
                onTabOpen={handleTabOpen}
                onTabClose={handleTabClose}
                className="w-full"
            >
                <Tab label="System">
                    <SystemPage />
                </Tab>
                <Tab label="Database">
                    <DatabasePage />
                </Tab>
                <Tab label="Logs">
                    <p>NYI Logs</p>
                </Tab>
            </TabsController>
        </div>
    );
}
