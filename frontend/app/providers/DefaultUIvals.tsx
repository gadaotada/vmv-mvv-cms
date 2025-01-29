import { createContext, useContext, useState, type ReactNode, useMemo } from 'react';

interface MonitorSettings {
    cardOrder: string[];
    hiddenCards: string[];
}

export interface DefaultSettings {
    sidebarToggled: boolean;
    systemMonitor: MonitorSettings;
    databaseMonitor: MonitorSettings;
}

interface DefaultUIvalsTypes {
    values: DefaultSettings;
    updateSettings: (newValue: Partial<DefaultSettings>) => void;
}

const defSettings: DefaultSettings = {
    sidebarToggled: false,
    systemMonitor: {
        cardOrder: ['cpu', 'memory', 'heap', 'network', 'os'],
        hiddenCards: []
    },
    databaseMonitor: {
        cardOrder: ['connections', 'queries', 'innodb', 'performance', 'processes'],
        hiddenCards: []
    }
};

function loadDefaults() {
    localStorage.setItem("ui-settings-curr", JSON.stringify(defSettings));
    return defSettings;
}

function getUIsettings(): DefaultSettings {
    const settings = localStorage.getItem("ui-settings-curr");
    if (settings) {
        try {
            const currentSettings = JSON.parse(settings);
            return { ...defSettings, ...currentSettings };
        } catch (err) {
            console.error(err);
            return loadDefaults();
        }
    } else {
        return loadDefaults();
    }
}

const DefaultUIvals = createContext<DefaultUIvalsTypes | undefined>(undefined);

export const DefaultUIvalsProvider = ({ children }: { children: ReactNode }) => {
    const [settings, setSettings] = useState<DefaultSettings>(getUIsettings());

    const handleSettingUpdate = (newValue: Partial<DefaultSettings>) => {
        const updatedSettings = { ...settings, ...newValue };
        localStorage.setItem("ui-settings-curr", JSON.stringify(updatedSettings));
        setSettings(updatedSettings);
    };

    const value = useMemo<DefaultUIvalsTypes>(() => ({
        values: { ...settings },
        updateSettings: handleSettingUpdate,
    }), [settings]);

    return <DefaultUIvals.Provider value={value}>{children}</DefaultUIvals.Provider>;
};

export const useDefaultUIvals = () => {
    const context = useContext(DefaultUIvals);
    if (!context) {
        throw new Error('useDefaultUIvals must be used within a DefaultUIvalsProvider');
    }
    return context;
};
