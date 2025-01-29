import { useState, useEffect } from "react";

import { useDefaultUIvals } from '~/providers/DefaultUIvals';
import { DndContext, closestCenter } from '@dnd-kit/core';
import { SortableContext, arrayMove } from '@dnd-kit/sortable';
import { MonitorCard } from '~/ui/components/monitor/MonitorCard';
import { ProgressBar } from '~/ui/progress-bar';
import { formatNumber, formatUptime } from '~/utils/formatters';
import { pooler } from "~/utils/pooler";
import Loader from "~/ui/loader";

export default function DatabasePage() {
    const { values, updateSettings } = useDefaultUIvals();
    const [stats, setStats] = useState<any>(null);

    const handleDragEnd = (event: any) => {
        const { active, over } = event;
        if (active.id !== over.id) {
            const oldIndex = values.databaseMonitor.cardOrder.indexOf(active.id);
            const newIndex = values.databaseMonitor.cardOrder.indexOf(over.id);
            const newOrder = arrayMove(values.databaseMonitor.cardOrder, oldIndex, newIndex);
            
            updateSettings({ databaseMonitor: { ...values.databaseMonitor, cardOrder: newOrder } });
        }
    };

    const toggleCardVisibility = (cardId: string) => {
        const hiddenCards = [...values.databaseMonitor.hiddenCards];
        const index = hiddenCards.indexOf(cardId);
        
        if (index === -1) {
            hiddenCards.push(cardId);
        } else {
            hiddenCards.splice(index, 1);
        }
        
        updateSettings({ databaseMonitor: { ...values.databaseMonitor, hiddenCards } });
    };

    useEffect(() => {
        const cleanup = pooler('/monitor/database', 'get', null, 1500, setStats);
        return cleanup;
    }, []);

    if (!stats) return <Loader />;

    return (
        <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={values.databaseMonitor.cardOrder}>
                <div className="p-6 bg-gray-50 min-h-screen w-full">
                    <div className="mb-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-2xl font-bold">Database Monitor</h2>
                        </div>
                        <p className="text-gray-600 mt-1">
                            MySQL {stats.version} • Uptime: {formatUptime(stats.uptime)}
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {values.databaseMonitor.cardOrder.map(cardId => {
                            const isVisible = !values.databaseMonitor.hiddenCards.includes(cardId);
                            
                            switch(cardId) {
                                case 'connections':
                                    return (
                                        <MonitorCard
                                            key={cardId}
                                            id={cardId}
                                            title="Connections"
                                            isVisible={isVisible}
                                            onVisibilityToggle={toggleCardVisibility}
                                        >
                                            <ProgressBar 
                                                label="Active Connections"
                                                value={stats.connections.current}
                                                total={stats.connections.max}
                                                color={
                                                    (stats.connections.current / stats.connections.max) > 0.9 ? "red" :
                                                    (stats.connections.current / stats.connections.max) > 0.7 ? "yellow" :
                                                    "blue"
                                                }
                                            />
                                            <div className="mt-4 grid grid-cols-2 gap-4">
                                                <div className="bg-gray-50 p-3 rounded">
                                                    <p className="text-gray-500 text-sm">Running</p>
                                                    <p className="font-semibold">{stats.connections.active}</p>
                                                </div>
                                                <div className="bg-gray-50 p-3 rounded">
                                                    <p className="text-gray-500 text-sm">Total</p>
                                                    <p className="font-semibold">{formatNumber(stats.connections.total)}</p>
                                                </div>
                                                <div className="bg-red-50 p-3 rounded">
                                                    <p className="text-red-500 text-sm">Aborted</p>
                                                    <p className="font-semibold text-red-700">{formatNumber(stats.connections.aborted)}</p>
                                                </div>
                                                <div className="bg-yellow-50 p-3 rounded">
                                                    <p className="text-yellow-600 text-sm">Max Used</p>
                                                    <p className="font-semibold text-yellow-700">{formatNumber(stats.connections.maxUsed)}</p>
                                                </div>
                                            </div>
                                        </MonitorCard>
                                    );
                                case 'queries':
                                    return (
                                        <MonitorCard
                                            key={cardId}
                                            id={cardId}
                                            title="Query Statistics"
                                            isVisible={isVisible}
                                            onVisibilityToggle={toggleCardVisibility}
                                        >
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="bg-blue-50 p-3 rounded">
                                                    <p className="text-blue-600 text-sm">SELECT</p>
                                                    <p className="font-semibold text-blue-700">{formatNumber(stats.queries.selects)}</p>
                                                </div>
                                                <div className="bg-green-50 p-3 rounded">
                                                    <p className="text-green-600 text-sm">INSERT</p>
                                                    <p className="font-semibold text-green-700">{formatNumber(stats.queries.inserts)}</p>
                                                </div>
                                                <div className="bg-yellow-50 p-3 rounded">
                                                    <p className="text-yellow-600 text-sm">UPDATE</p>
                                                    <p className="font-semibold text-yellow-700">{formatNumber(stats.queries.updates)}</p>
                                                </div>
                                                <div className="bg-red-50 p-3 rounded">
                                                    <p className="text-red-600 text-sm">DELETE</p>
                                                    <p className="font-semibold text-red-700">{formatNumber(stats.queries.deletes)}</p>
                                                </div>
                                            </div>
                                            <div className="mt-4 space-y-4">
                                                <div className="bg-gray-50 p-3 rounded">
                                                    <p className="text-gray-500 text-sm">Total Queries</p>
                                                    <p className="font-semibold">{formatNumber(stats.queries.total)}</p>
                                                </div>
                                                <div className="bg-red-50 p-3 rounded">
                                                    <p className="text-red-600 text-sm">Slow Queries</p>
                                                    <p className="font-semibold text-red-700">{formatNumber(stats.queries.slow)}</p>
                                                </div>
                                            </div>
                                        </MonitorCard>
                                    );
                                case 'innodb':
                                    return (
                                        <MonitorCard
                                            key={cardId}
                                            id={cardId}
                                            title="InnoDB Statistics"
                                            isVisible={isVisible}
                                            onVisibilityToggle={toggleCardVisibility}
                                        >
                                            <ProgressBar 
                                                label="Buffer Pool Usage"
                                                value={stats.innodb.bufferPoolUsed}
                                                total={stats.innodb.bufferPoolSize}
                                                color="green"
                                            />
                                            <div className="grid grid-cols-2 gap-4 mt-2">
                                                <div className="bg-blue-50 p-3 rounded">
                                                    <p className="text-blue-600 text-sm">Read Requests</p>
                                                    <p className="font-semibold text-blue-700">{formatNumber(stats.innodb.readRequests)}</p>
                                                </div>
                                                <div className="bg-green-50 p-3 rounded">
                                                    <p className="text-green-600 text-sm">Write Requests</p>
                                                    <p className="font-semibold text-green-700">{formatNumber(stats.innodb.writeRequests)}</p>
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="bg-blue-50 p-3 rounded">
                                                    <p className="text-blue-600 text-sm">Pages Read</p>
                                                    <p className="font-semibold text-blue-700">{formatNumber(stats.innodb.pagesRead)}</p>
                                                </div>
                                                <div className="bg-green-50 p-3 rounded">
                                                    <p className="text-green-600 text-sm">Pages Written</p>
                                                    <p className="font-semibold text-green-700">{formatNumber(stats.innodb.pagesWritten)}</p>
                                                </div>
                                            </div>
                                        </MonitorCard>
                                    );
                                case 'performance':
                                    return (
                                        <MonitorCard
                                            key={cardId}
                                            id={cardId}
                                            title="Performance Metrics"
                                            isVisible={isVisible}
                                            onVisibilityToggle={toggleCardVisibility}
                                        >
                                                <div className="space-y-4">
                                                    <div className="grid grid-cols-2 gap-4">
                                                        <div className="bg-green-50 p-3 rounded">
                                                            <p className="text-green-600 text-sm">Cache Hits</p>
                                                            <p className="font-semibold text-green-700">{formatNumber(stats.performance.tableOpenCacheHits)}</p>
                                                        </div>
                                                        <div className="bg-red-50 p-3 rounded">
                                                            <p className="text-red-600 text-sm">Cache Misses</p>
                                                            <p className="font-semibold text-red-700">{formatNumber(stats.performance.tableCacheMisses)}</p>
                                                        </div>
                                                    </div>
                                                    <div className="space-y-2 text-sm">
                                                        <div className="grid grid-cols-2 gap-2">
                                                            <div>Full Table Scans:</div>
                                                            <div className="text-right">{formatNumber(stats.performance.fullTableScans)}</div>
                                                            <div>Full Join Scans:</div>
                                                            <div className="text-right">{formatNumber(stats.performance.fullJoinScans)}</div>
                                                            <div>Temp Tables Created:</div>
                                                            <div className="text-right">{formatNumber(stats.performance.tmpTablesCreated)}</div>
                                                            <div>Temp Tables on Disk:</div>
                                                            <div className="text-right">{formatNumber(stats.performance.tmpTablesOnDisk)}</div>
                                                        </div>
                                                    </div>
                                                </div>
                                        </MonitorCard>
                                    );
                                case 'processes':
                                    return (
                                        <MonitorCard
                                            key={cardId}
                                            id={cardId}
                                            title="Active Processes"
                                            isVisible={isVisible}
                                            onVisibilityToggle={toggleCardVisibility}
                                            customWidth={"w-full col-span-2"}
                                        >
                                            <div className="overflow-x-auto max-h-[300px] overflow-y-auto">
                                                <table className="w-full table-fixed border-separate border-spacing-0">
                                                    <colgroup>
                                                        <col className="w-[65px]" />
                                                        <col className="w-[85px]" />
                                                        <col className="w-[100px]" />
                                                        <col className="w-[100px]" />
                                                        <col className="w-[100px]" />
                                                        <col className="w-[70px]" />
                                                        <col className="w-[170px]" />
                                                        <col className="w-[170px]" />
                                                    </colgroup>
                                                    <thead>
                                                        <tr>
                                                            <th className="sticky top-0 bg-white px-4 py-2 text-left text-sm font-medium text-gray-500">ID</th>
                                                            <th className="sticky top-0 bg-white px-4 py-2 text-left text-sm font-medium text-gray-500">User</th>
                                                            <th className="sticky top-0 bg-white px-4 py-2 text-left text-sm font-medium text-gray-500">Host</th>
                                                            <th className="sticky top-0 bg-white px-4 py-2 text-left text-sm font-medium text-gray-500">DB</th>
                                                            <th className="sticky top-0 bg-white px-4 py-2 text-left text-sm font-medium text-gray-500">Command</th>
                                                            <th className="sticky top-0 bg-white px-4 py-2 text-left text-sm font-medium text-gray-500">Time</th>
                                                            <th className="sticky top-0 bg-white px-4 py-2 text-left text-sm font-medium text-gray-500">State</th>
                                                            <th className="sticky top-0 bg-white px-4 py-2 text-left text-sm font-medium text-gray-500">Info</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {stats.processes.map((process: any) => (
                                                            <tr key={process.id}>
                                                                <td className="px-4 py-2 text-xs overflow-hidden text-ellipsis whitespace-nowrap">{process.id}</td>
                                                                <td className="px-4 py-2 text-xs overflow-hidden text-ellipsis whitespace-nowrap">{process.user}</td>
                                                                <td className="px-4 py-2 text-xs overflow-hidden text-ellipsis whitespace-nowrap">{process.host}</td>
                                                                <td className="px-4 py-2 text-xs overflow-hidden text-ellipsis whitespace-nowrap">{process.db || '-'}</td>
                                                                <td className="px-4 py-2 text-xs overflow-hidden text-ellipsis whitespace-nowrap">{process.command}</td>
                                                                <td className="px-4 py-2 text-xs overflow-hidden text-ellipsis whitespace-nowrap">{process.time}s</td>
                                                                <td className="px-4 py-2 text-xs overflow-hidden text-ellipsis whitespace-nowrap">{process.state || '-'}</td>
                                                                <td className="px-4 py-2 text-xs overflow-hidden text-ellipsis whitespace-nowrap">{process.info || '-'}</td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
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