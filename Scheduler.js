/**
 * Scheduler.js
 * Cloud Task Scheduler implementation
 */

class CloudScheduler {
    constructor() {
        this.servers = [];
        this.taskQueue = [];
        this.completedTasks = [];
        this.currentTime = 0;
        this.algorithm = 'round-robin';
        this.taskCounter = 0;
    }

    initServers(count) {
        this.servers = [];
        for (let i = 0; i < count; i++) {
            this.servers.push({
                id: i,
                name: `Server ${i}`,
                runningTask: null,
                queue: [],
                cpuUsage: 0,
                ramUsage: 0,
                totalProcessed: 0,
                getLoad() {
                    return (this.cpuUsage / 100 + this.ramUsage / 100) / 2;
                },
                getStatus() {
                    const load = this.getLoad();
                    if (load > 0.8) return 'danger';
                    if (load > 0.5) return 'warning';
                    return 'normal';
                }
            });
        }
    }

    addTask(taskData) {
        const task = {
            id: this.taskCounter++,
            name: taskData.name,
            priority: parseInt(taskData.priority) || 1,
            cpu: parseInt(taskData.cpu) || 50,
            ram: parseInt(taskData.ram) || 512,
            arrivalTime: parseInt(taskData.arrivalTime) || 0,
            deadline: parseInt(taskData.deadline) || 10,
            category: taskData.category || 'compute',
            startTime: null,
            endTime: null,
            status: 'pending',
            getTurnaroundTime() {
                if (this.endTime && this.startTime) {
                    return this.endTime - this.startTime;
                }
                return 0;
            }
        };
        this.taskQueue.push(task);
        return task;
    }

    addBulkTasks(count, pattern) {
        const tasks = [];
        const patterns = {
            normal: () => ({ priority: Math.floor(Math.random() * 4) + 1, cpu: 40 + Math.random() * 40, ram: 400 + Math.random() * 300 }),
            burst: () => ({ priority: Math.random() < 0.7 ? 4 : Math.floor(Math.random() * 3) + 1, cpu: Math.random() < 0.5 ? 80 : 30, ram: Math.random() < 0.5 ? 1500 : 400 }),
            heavy: () => ({ priority: 3 + Math.floor(Math.random() * 2), cpu: 70 + Math.random() * 30, ram: 1000 + Math.random() * 1000 })
        };

        const generator = patterns[pattern] || patterns.normal;

        for (let i = 0; i < count; i++) {
            const params = generator();
            const task = this.addTask({
                name: `Task-${this.taskCounter}`,
                priority: params.priority,
                cpu: Math.round(params.cpu),
                ram: Math.round(params.ram),
                arrivalTime: 0,
                deadline: 10 + Math.random() * 10,
                category: ['compute', 'memory', 'network', 'mixed'][Math.floor(Math.random() * 4)]
            });
            tasks.push(task);
        }
        return tasks;
    }

    simulateStep(timeStep) {
        this.currentTime += timeStep;

        // Schedule tasks to servers
        this._scheduleTasks();

        // Process tasks
        this.servers.forEach(server => {
            if (server.runningTask) {
                server.runningTask.remainingTime = (server.runningTask.remainingTime || 5) - timeStep;
                server.cpuUsage = server.runningTask.cpu;
                server.ramUsage = Math.min((server.runningTask.ram / 4096) * 100, 100);

                if (server.runningTask.remainingTime <= 0) {
                    const completedTask = server.runningTask;
                    completedTask.status = 'completed';
                    completedTask.endTime = this.currentTime;
                    this.completedTasks.push(completedTask);
                    server.totalProcessed++;

                    server.runningTask = null;
                    server.cpuUsage = 0;
                    server.ramUsage = 0;

                    if (server.queue.length > 0) {
                        server.runningTask = server.queue.shift();
                        server.runningTask.status = 'running';
                    }
                }
            }
        });
    }

    _scheduleTasks() {
        while (this.taskQueue.length > 0) {
            const task = this.taskQueue[0];

            if (task.arrivalTime <= this.currentTime) {
                const server = this._selectServer();
                if (server) {
                    this.taskQueue.shift();
                    if (server.runningTask === null) {
                        task.status = 'running';
                        task.startTime = this.currentTime;
                        server.runningTask = task;
                        task.remainingTime = 5;
                    } else {
                        task.status = 'queued';
                        server.queue.push(task);
                    }
                } else {
                    break;
                }
            } else {
                break;
            }
        }
    }

    _selectServer() {
        if (this.algorithm === 'round-robin') {
            return this.servers.reduce((least, current) =>
                (current.runningTask === null && current.queue.length === 0) ? current : least
            ) || this.servers.reduce((least, current) =>
                (current.queue.length < least.queue.length) ? current : least
            );
        } else if (this.algorithm === 'least-loaded') {
            return this.servers.reduce((least, current) =>
                current.getLoad() < least.getLoad() ? current : least
            );
        }
        return this.servers[0];
    }

    getMetrics() {
        const completed = this.completedTasks.length;
        const total = this.taskCounter;
        const waitTimes = this.completedTasks.map(t => (t.startTime || 0) - (t.arrivalTime || 0)).filter(t => t >= 0);
        const avgWaitTime = waitTimes.length > 0 ? (waitTimes.reduce((a, b) => a + b, 0) / waitTimes.length).toFixed(2) : '0.00';
        const throughput = (completed / Math.max(this.currentTime, 1)).toFixed(2);

        return {
            totalTasks: total,
            completedTasks: completed,
            pendingTasks: this.taskQueue.length,
            avgWaitTime,
            throughput
        };
    }

    reset() {
        this.taskQueue = [];
        this.completedTasks = [];
        this.currentTime = 0;
        this.servers.forEach(s => {
            s.runningTask = null;
            s.queue = [];
            s.cpuUsage = 0;
            s.ramUsage = 0;
            s.totalProcessed = 0;
        });
    }
}
