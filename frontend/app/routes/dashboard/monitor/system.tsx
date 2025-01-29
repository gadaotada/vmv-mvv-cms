import { useState, useEffect } from "react";

import { useDefaultUIvals } from '~/providers/DefaultUIvals';
import { DndContext, closestCenter } from '@dnd-kit/core';
import { SortableContext, arrayMove } from '@dnd-kit/sortable';
import { MonitorCard } from '~/ui/components/monitor/MonitorCard';
import { ProgressBar } from '~/ui/progress-bar';
import { formatUptime } from '~/utils/formatters';
import { pooler } from "~/utils/pooler";
import Loader from "~/ui/loader";

export default function SystemPage() {
    const { values, updateSettings } = useDefaultUIvals();
    const [stats, setStats] = useState<any>(null);

    const handleDragEnd = (event: any) => {
        const { active, over } = event;
        if (active.id !== over.id) {
            const oldIndex = values.systemMonitor.cardOrder.indexOf(active.id);
            const newIndex = values.systemMonitor.cardOrder.indexOf(over.id);
            const newOrder = arrayMove(values.systemMonitor.cardOrder, oldIndex, newIndex);
            
            updateSettings({ systemMonitor: { ...values.systemMonitor, cardOrder: newOrder } });
        }
    };

    const toggleCardVisibility = (cardId: string) => {
        const hiddenCards = [...values.systemMonitor.hiddenCards];
        const index = hiddenCards.indexOf(cardId);
        
        if (index === -1) {
            hiddenCards.push(cardId);
        } else {
            hiddenCards.splice(index, 1);
        }
        
        updateSettings({ systemMonitor: { ...values.systemMonitor, hiddenCards } });
    };

    useEffect(() => {
        const cleanup = pooler('/monitor/system', 'get', null, 1500, setStats);
        return cleanup;
    }, []);

    if (!stats) return <Loader />
    return (
        <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={values.systemMonitor.cardOrder}>
                <div className="p-6 bg-gray-50 min-h-screen min-w-[calc(100vw-200px)]">
                    <div className="mb-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-2xl font-bold">System Monitor</h2>
                        </div>
                        <p className="text-gray-600 mt-1">
                            {stats.os.type} • {stats.os.platform} • Uptime: {formatUptime(stats.os.uptime)}
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {values.systemMonitor.cardOrder.map(cardId => {
                            const isVisible = !values.systemMonitor.hiddenCards.includes(cardId);
                            
                            switch(cardId) {
                                case 'cpu':
                                    return (
                                        <MonitorCard
                                            key={cardId}
                                            id={cardId}
                                            title="CPU Usage"
                                            isVisible={isVisible}
                                            onVisibilityToggle={toggleCardVisibility}
                                        >
                                            <div className="space-y-4">
                                                <ProgressBar 
                                                    label="CPU Usage"
                                                    value={stats.cpu.usage}
                                                    total={100}
                                                    color={
                                                        stats.cpu.usage > 90 ? "red" :
                                                        stats.cpu.usage > 70 ? "yellow" :
                                                        "blue"
                                                    }
                                                />
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="bg-gray-50 p-3 rounded">
                                                        <p className="text-gray-500 text-sm">Cores</p>
                                                        <p className="font-semibold">{stats.cpu.cores}</p>
                                                    </div>
                                                    <div className="bg-gray-50 p-3 rounded">
                                                        <p className="text-gray-500 text-sm">Speed</p>
                                                        <p className="font-semibold">{stats.cpu.speed.current} GHz</p>
                                                    </div>
                                                </div>
                                                <div className="bg-gray-50 p-3 rounded">
                                                    <p className="text-gray-500 text-sm">Model</p>
                                                    <p className="font-semibold text-sm">{stats.cpu.model}</p>
                                                </div>
                                            </div>
                                        </MonitorCard>
                                    );
                                case 'memory':
                                    return (
                                        <MonitorCard
                                            key={cardId}
                                            id={cardId}
                                            title="Memory Usage"
                                            isVisible={isVisible}
                                            onVisibilityToggle={toggleCardVisibility}
                                        >
                                            <div className="space-y-4">
                                                <ProgressBar 
                                                    label="Memory Usage"
                                                    value={stats.memory.used}
                                                    total={stats.memory.total}
                                                    color={
                                                        (stats.memory.used / stats.memory.total) > 0.9 ? "red" :
                                                        (stats.memory.used / stats.memory.total) > 0.7 ? "yellow" :
                                                        "blue"
                                                    }
                                                />
                                                <div className="grid grid-cols-3 gap-4">
                                                    <div className="bg-blue-50 p-3 rounded">
                                                        <p className="text-blue-600 text-sm">Total</p>
                                                        <p className="font-semibold">{stats.memory.total} GB</p>
                                                    </div>
                                                    <div className="bg-green-50 p-3 rounded">
                                                        <p className="text-green-600 text-sm">Used</p>
                                                        <p className="font-semibold">{stats.memory.used} GB</p>
                                                    </div>
                                                    <div className="bg-gray-50 p-3 rounded">
                                                        <p className="text-gray-500 text-sm">Free</p>
                                                        <p className="font-semibold">{stats.memory.free} GB</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </MonitorCard>
                                    );
                                case 'heap':
                                    return (
                                        <MonitorCard
                                            key={cardId}
                                            id={cardId}
                                            title="V8 Heap Usage"
                                            isVisible={isVisible}
                                            onVisibilityToggle={toggleCardVisibility}
                                        >
                                            <div className="space-y-4">
                                                <ProgressBar 
                                                    label="Heap Usage"
                                                    value={stats.heap.used}
                                                    total={stats.heap.total}
                                                    color={
                                                        (stats.heap.used / stats.heap.total) > 0.9 ? "red" :
                                                        (stats.heap.used / stats.heap.total) > 0.7 ? "yellow" :
                                                        "blue"
                                                    }
                                                />
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="bg-blue-50 p-3 rounded">
                                                        <p className="text-blue-600 text-sm">Total Limit</p>
                                                        <p className="font-semibold">{stats.heap.total} MB</p>
                                                    </div>
                                                    <div className="bg-green-50 p-3 rounded">
                                                        <p className="text-green-600 text-sm">Currently Used</p>
                                                        <p className="font-semibold">{stats.heap.used} MB</p>
                                                    </div>
                                                    <div className="bg-yellow-50 p-3 rounded">
                                                        <p className="text-yellow-600 text-sm">Allocated</p>
                                                        <p className="font-semibold">{stats.heap.allocated} MB</p>
                                                    </div>
                                                    <div className="bg-gray-50 p-3 rounded">
                                                        <p className="text-gray-500 text-sm">Available</p>
                                                        <p className="font-semibold">{stats.heap.available} MB</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </MonitorCard>
                                    );
                                case 'network':
                                    return (
                                        <MonitorCard
                                            key={cardId}
                                            id={cardId}
                                            title="Network"
                                            isVisible={isVisible}
                                            onVisibilityToggle={toggleCardVisibility}
                                        >
                                            <div className="space-y-4">
                                                <div className="bg-gray-50 p-4 rounded-lg">
                                                    <div className="text-sm font-medium text-gray-500 mb-2">Current Traffic</div>
                                                    <div className="grid grid-cols-2 gap-4">
                                                        <div className="bg-green-50 p-3 rounded">
                                                            <p className="text-green-600 text-sm">Download</p>
                                                            <p className="font-semibold">{stats.network.download_speed} Mbps</p>
                                                        </div>
                                                        <div className="bg-blue-50 p-3 rounded">
                                                            <p className="text-blue-600 text-sm">Upload</p>
                                                            <p className="font-semibold">{stats.network.upload_speed} Mbps</p>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="bg-gray-50 p-4 rounded-lg">
                                                    <div className="text-sm font-medium text-gray-500 mb-2">Total Transfer</div>
                                                    <div className="grid grid-cols-2 gap-4">
                                                        <div className="bg-gray-100 p-3 rounded">
                                                            <p className="text-gray-600 text-sm">Downloaded</p>
                                                            <p className="font-semibold">{stats.network.total_downloaded} GB</p>
                                                        </div>
                                                        <div className="bg-gray-100 p-3 rounded">
                                                            <p className="text-gray-600 text-sm">Uploaded</p>
                                                            <p className="font-semibold">{stats.network.total_uploaded} GB</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </MonitorCard>
                                    );
                            }
                        })}
                    </div>
                </div>
            </SortableContext>
        </DndContext>
    );
}
  