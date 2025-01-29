import { type DefaultSettings } from "~/providers/DefaultUIvals";

export const getCurrentSettingsPerTab = (values: Partial<DefaultSettings>, activeView: string) => {
    if (activeView === "System") {
        return values.systemMonitor;
    } else if (activeView === "Database") {
        return values.databaseMonitor;
    }
    return null;
}