import * as os from 'os';
import v8 from 'v8';
import { readFileSync, existsSync } from 'fs';
import { exec } from 'child_process';
import { promisify } from 'util';
import { Server } from 'http';
import { WebSocketServer } from 'ws';

export class SystemService {
    private static instance: SystemService;
    private lastCpuUsage = {
        idle: 0,
        total: 0
    };
    private lastNetworkStats: { rx_bytes: number; tx_bytes: number } = { rx_bytes: 0, tx_bytes: 0 };
    private lastStatsTime = Date.now();
    private isFirstRun = true;
    private execAsync = promisify(exec);
    
    // Cache system info that doesn't change frequently
    private cpuInfo = {
        cores: os.cpus().length,
        model: os.cpus()[0].model
    };
    private totalMemory = os.totalmem();
    private osInfo = {
        platform: os.platform(),
        type: os.type(),
        release: os.release()
    };

    // Cache for network stats command (refresh every 5 seconds)
    private cachedNetworkStats: any = null;
    private lastNetworkStatsTime = 0;
    private NETWORK_STATS_TTL = 5000; // 5 seconds

    private constructor() {
        // Initialize CPU usage on startup
        this.calculateCPUUsage();
    }

    public static getInstance() {
        if (!SystemService.instance) {
            SystemService.instance = new SystemService();
        }
        return SystemService.instance;
    }

    private calculateCPUUsage() {
        const cpus = os.cpus();
        let idle = 0;
        let total = 0;

        for (const cpu of cpus) {
            idle += cpu.times.idle;
            total += cpu.times.idle + cpu.times.user + cpu.times.sys + cpu.times.nice + cpu.times.irq;
        }

        const idleDiff = idle - this.lastCpuUsage.idle;
        const totalDiff = total - this.lastCpuUsage.total;

        const usage = 100 - Math.round((idleDiff / totalDiff) * 100);

        // Store current values for next calculation
        this.lastCpuUsage = { idle, total };

        return usage;
    }

    private async getNetworkStats() {
        let totalRx = 0;
        let totalTx = 0;
        const now = Date.now();
        const platform = this.osInfo.platform;

        try {
            if (platform === 'linux' && existsSync('/proc/net/dev')) {
                // Linux is fast enough to read directly
                const netDev = readFileSync('/proc/net/dev', 'utf-8');
                const lines = netDev.split('\n').slice(2);
                
                lines.forEach(line => {
                    const parts = line.trim().split(/\s+/);
                    if (parts.length >= 10) {
                        totalRx += parseInt(parts[1], 10);
                        totalTx += parseInt(parts[9], 10);
                    }
                });
            } else if (platform === 'win32') {
                // Use cached network stats if within TTL
                if (this.cachedNetworkStats && (now - this.lastNetworkStatsTime) < this.NETWORK_STATS_TTL) {
                    totalRx = this.cachedNetworkStats.rx;
                    totalTx = this.cachedNetworkStats.tx;
                } else {
                    const { stdout } = await this.execAsync(
                        'powershell "Get-NetAdapter | Get-NetAdapterStatistics | Select-Object ReceivedBytes, SentBytes | ConvertTo-Json"'
                    );
                    
                    const adapters = JSON.parse(stdout);
                    
                    (Array.isArray(adapters) ? adapters : [adapters]).forEach((adapter: any) => {
                        totalRx += parseInt(adapter.ReceivedBytes || '0', 10);
                        totalTx += parseInt(adapter.SentBytes || '0', 10);
                    });

                    // Cache the results
                    this.cachedNetworkStats = { rx: totalRx, tx: totalTx };
                    this.lastNetworkStatsTime = now;
                }
            }
        } catch (error) {
            console.error('Error getting network stats:', error);
            // Use last known good values if available
            if (this.lastNetworkStats) {
                totalRx = this.lastNetworkStats.rx_bytes;
                totalTx = this.lastNetworkStats.tx_bytes;
            }
        }

        // Skip first run to establish baseline
        if (this.isFirstRun) {
            this.lastNetworkStats = { rx_bytes: totalRx, tx_bytes: totalTx };
            this.lastStatsTime = Date.now();
            this.isFirstRun = false;
            return {
                download_speed: 0,
                upload_speed: 0,
                total_downloaded: Math.round(totalRx / (1024 * 1024 * 1024)),
                total_uploaded: Math.round(totalTx / (1024 * 1024 * 1024))
            };
        }

        const timeDiff = (now - this.lastStatsTime) / 1000;

        const rx_diff = Math.max(0, totalRx - this.lastNetworkStats.rx_bytes);
        const tx_diff = Math.max(0, totalTx - this.lastNetworkStats.tx_bytes);

        // Calculate speed in Mbps
        const rx_speed = (rx_diff * 8) / (timeDiff * 1024 * 1024);
        const tx_speed = (tx_diff * 8) / (timeDiff * 1024 * 1024);

        // Update last stats
        this.lastNetworkStats = { rx_bytes: totalRx, tx_bytes: totalTx };
        this.lastStatsTime = now;

        // Format speeds with appropriate precision based on size
        const formatSpeed = (speed: number) => {
            if (speed < 0.01) return 0;
            if (speed < 1) return Math.round(speed * 1000) / 1000;
            if (speed < 10) return Math.round(speed * 100) / 100;
            return Math.round(speed * 10) / 10;
        };

        return {
            download_speed: formatSpeed(rx_speed),
            upload_speed: formatSpeed(tx_speed),
            total_downloaded: Math.round(totalRx / (1024 * 1024 * 1024)),
            total_uploaded: Math.round(totalTx / (1024 * 1024 * 1024))
        };
    }

    async getSystemStats() {
        // Get current memory values (these need to be real-time)
        const freeMem = os.freemem();
        const usedMem = this.totalMemory - freeMem;
        
        // Get heap stats (real-time)
        const heapStats = v8.getHeapStatistics();
        
        // Get network and connection stats (potentially cached)
        const [networkStats] = await Promise.all([
            this.getNetworkStats(),
        ]);

        return {
            cpu: {
                usage: this.calculateCPUUsage(),
                cores: this.cpuInfo.cores,
                model: this.cpuInfo.model,
                speed: {
                    current: os.cpus()[0].speed / 1000,
                }
            },
            memory: {
                total: Math.round(this.totalMemory / (1024 * 1024 * 1024)),
                used: Math.round(usedMem / (1024 * 1024 * 1024)),
                free: Math.round(freeMem / (1024 * 1024 * 1024)),
                usagePercentage: Math.round((usedMem / this.totalMemory) * 100)
            },
            heap: {
                total: Math.round(heapStats.heap_size_limit / (1024 * 1024)),
                used: Math.round(heapStats.used_heap_size / (1024 * 1024)),
                allocated: Math.round(heapStats.total_heap_size / (1024 * 1024)),
                available: Math.round((heapStats.heap_size_limit - heapStats.used_heap_size) / (1024 * 1024))
            },
            network: networkStats,
            os: {
                ...this.osInfo,
                uptime: Math.floor(os.uptime())
            }
        };
    }
}
