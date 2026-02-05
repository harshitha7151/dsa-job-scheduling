/**
 * app.js
 * Main application logic and event handlers
 */

// Global State
let scheduler = new CloudScheduler();
let visualizer = new Visualizer();

// Data structures for DSA Lab
let heapDS = new MinHeap();
let queueDS = new Queue();
let bstDS = new BinarySearchTree();
let hashmapDS = new HashMap();
let linkedlistDS = new LinkedList();

// Charts
let charts = {
    waitTime: null,
    throughput: null,
    loadDist: null,
    responseTime: null
};

// Simulation state
let simulationRunning = false;
let simulationInterval = null;
let simulationSpeed = 1;
let cpuUsage = 0;
let ramUsage = 0;

// ===================================
// INITIALIZATION
// ===================================

document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
    setupEventListeners();
    initializeCharts();
    startClock();
    startSystemMonitors();
    
    visualizer.addLog('System initialized successfully', 'success');
});

function initializeApp() {
    // Initialize scheduler with 4 servers
    scheduler.initServers(4);
    
    // Render initial server grid
    visualizer.renderServerGrid(scheduler.servers, 'serverGrid');
    
    // Load demo tasks into pool
    const demoTasks = Utils.generateDemoTasks();
    demoTasks.forEach(taskData => {
        const task = scheduler.addTask(taskData);
        const card = visualizer.createTaskCard(task);
        document.getElementById('taskPool').appendChild(card);
    });
    
    scheduler.taskQueue = []; // Clear the queue after creating cards
}

// ===================================
// EVENT LISTENERS
// ===================================

function setupEventListeners() {
    // Tab Navigation
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            switchTab(e.target.dataset.tab);
        });
    });

    // Manual Task Form
    document.getElementById('manualTaskForm').addEventListener('submit', (e) => {
        e.preventDefault();
        createManualTask();
    });

    // Bulk Task Generator
    document.getElementById('generateBulkBtn').addEventListener('click', generateBulkTasks);

    // Simulation Controls
    document.getElementById('startSimBtn').addEventListener('click', startSimulation);
    document.getElementById('pauseSimBtn').addEventListener('click', pauseSimulation);
    document.getElementById('resetSimBtn').addEventListener('click', resetSimulation);

    // Auto Demo
    document.getElementById('autoDemoBtn').addEventListener('click', runAutoDemo);

    // Speed Control
    document.getElementById('speedSlider').addEventListener('input', (e) => {
        simulationSpeed = parseFloat(e.target.value);
        document.getElementById('speedValue').textContent = simulationSpeed + 'x';
    });

    // Algorithm Selection
    document.getElementById('algorithmSelect').addEventListener('change', (e) => {
        scheduler.algorithm = e.target.value;
        visualizer.addLog(`Algorithm changed to: ${e.target.value}`, 'info');
    });

    // DSA Lab Navigation
    document.querySelectorAll('.dsa-nav-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            switchDSA(e.target.dataset.ds);
        });
    });

    // Heap Controls
    document.getElementById('heapInsert').addEventListener('click', () => {
        const name = document.getElementById('heapName').value;
        const priority = parseInt(document.getElementById('heapPriority').value);
        
        if (name && priority) {
            const result = heapDS.insert({ name, priority });
            visualizer.renderHeap(heapDS, 'heapTree');
            visualizer.updateSteps([
                `Inserted "${name}" with priority ${priority}`,
                `New heap size: ${result.size}`,
                `Performed bubble-up to maintain heap property`
            ], 'heapSteps');
            
            document.getElementById('heapName').value = '';
            document.getElementById('heapPriority').value = '';
        }
    });

    document.getElementById('heapExtractMin').addEventListener('click', () => {
        const min = heapDS.extractMin();
        if (min) {
            visualizer.renderHeap(heapDS, 'heapTree');
            visualizer.updateSteps([
                `Extracted minimum: "${min.name}" with priority ${min.priority}`,
                `Moved last element to root`,
                `Performed bubble-down to restore heap property`
            ], 'heapSteps');
        } else {
            visualizer.updateSteps('Heap is empty', 'heapSteps');
        }
    });

    document.getElementById('heapPeek').addEventListener('click', () => {
        const min = heapDS.peek();
        if (min) {
            visualizer.updateSteps([
                `Minimum element: "${min.name}" with priority ${min.priority}`,
                `This element is at the root (index 0)`,
                `Peek operation is O(1) - no modifications made`
            ], 'heapSteps');
        } else {
            visualizer.updateSteps('Heap is empty', 'heapSteps');
        }
    });

    document.getElementById('heapClear').addEventListener('click', () => {
        heapDS.clear();
        visualizer.renderHeap(heapDS, 'heapTree');
        visualizer.updateSteps('Heap cleared', 'heapSteps');
    });

    // Queue Controls
    document.getElementById('queueEnqueue').addEventListener('click', () => {
        const value = document.getElementById('queueValue').value;
        if (value) {
            queueDS.enqueue(value);
            visualizer.renderQueueLane(queueDS);
            visualizer.updateSteps([
                `Enqueued: "${value}"`,
                `Added to the rear of the queue`,
                `Queue size: ${queueDS.size()}`
            ], 'queueSteps');
            document.getElementById('queueValue').value = '';
        }
    });

    document.getElementById('queueDequeue').addEventListener('click', () => {
        const item = queueDS.dequeue();
        if (item) {
            visualizer.renderQueueLane(queueDS);
            visualizer.updateSteps([
                `Dequeued: "${item}"`,
                `Removed from the front of the queue`,
                `Remaining items: ${queueDS.size()}`
            ], 'queueSteps');
        } else {
            visualizer.updateSteps('Queue is empty', 'queueSteps');
        }
    });

    document.getElementById('queueFront').addEventListener('click', () => {
        const front = queueDS.front();
        if (front) {
            visualizer.updateSteps([
                `Front element: "${front}"`,
                `This is the next item to be dequeued`,
                `Front operation is O(1)`
            ], 'queueSteps');
        } else {
            visualizer.updateSteps('Queue is empty', 'queueSteps');
        }
    });

    document.getElementById('queueClear').addEventListener('click', () => {
        queueDS.clear();
        visualizer.renderQueueLane(queueDS);
        visualizer.updateSteps('Queue cleared', 'queueSteps');
    });

    // BST Controls
    document.getElementById('bstInsert').addEventListener('click', () => {
        const value = parseInt(document.getElementById('bstValue').value);
        if (value) {
            bstDS.insert(value);
            visualizer.renderBST(bstDS, 'bstTree');
            visualizer.updateSteps([
                `Inserted value: ${value}`,
                `Compared with existing nodes to find correct position`,
                `Maintained BST property: left < parent < right`
            ], 'bstSteps');
            document.getElementById('bstValue').value = '';
        }
    });

    document.getElementById('bstDelete').addEventListener('click', () => {
        const value = parseInt(document.getElementById('bstValue').value);
        if (value) {
            bstDS.delete(value);
            visualizer.renderBST(bstDS, 'bstTree');
            visualizer.updateSteps([
                `Deleted value: ${value}`,
                `Restructured tree to maintain BST property`,
                `Time complexity: O(log n) for balanced tree`
            ], 'bstSteps');
            document.getElementById('bstValue').value = '';
        }
    });

    document.getElementById('bstSearch').addEventListener('click', () => {
        const value = parseInt(document.getElementById('bstValue').value);
        if (value) {
            const found = bstDS.search(value);
            visualizer.updateSteps([
                `Searching for: ${value}`,
                found ? `Found! Value exists in the tree` : `Not found`,
                `Search path follows BST ordering property`
            ], 'bstSteps');
        }
    });

    document.getElementById('bstInorder').addEventListener('click', () => {
        const result = bstDS.inorder();
        visualizer.updateSteps([
            `Inorder Traversal: ${result.join(', ')}`,
            `Visits nodes in sorted order: Left → Root → Right`,
            `Useful for retrieving tasks sorted by deadline`
        ], 'bstSteps');
    });

    document.getElementById('bstPreorder').addEventListener('click', () => {
        const result = bstDS.preorder();
        visualizer.updateSteps([
            `Preorder Traversal: ${result.join(', ')}`,
            `Visits: Root → Left → Right`,
            `Useful for creating a copy of the tree`
        ], 'bstSteps');
    });

    document.getElementById('bstPostorder').addEventListener('click', () => {
        const result = bstDS.postorder();
        visualizer.updateSteps([
            `Postorder Traversal: ${result.join(', ')}`,
            `Visits: Left → Right → Root`,
            `Useful for deleting the tree`
        ], 'bstSteps');
    });

    document.getElementById('bstClear').addEventListener('click', () => {
        bstDS.clear();
        visualizer.renderBST(bstDS, 'bstTree');
        visualizer.updateSteps('Tree cleared', 'bstSteps');
    });

    // HashMap Controls
    document.getElementById('hashmapPut').addEventListener('click', () => {
        const key = document.getElementById('hashmapKey').value;
        const value = document.getElementById('hashmapValue').value;
        
        if (key && value) {
            const result = hashmapDS.put(key, value);
            visualizer.renderHashMap(hashmapDS, 'hashmapBuckets');
            visualizer.updateSteps([
                `Put: ${key} → ${value}`,
                `Hash function mapped to bucket ${result.index}`,
                result.collision ? `Collision handled using chaining` : `No collision`,
                `Average time complexity: O(1)`
            ], 'hashmapSteps');
            
            document.getElementById('hashmapKey').value = '';
            document.getElementById('hashmapValue').value = '';
        }
    });

    document.getElementById('hashmapGet').addEventListener('click', () => {
        const key = document.getElementById('hashmapKey').value;
        if (key) {
            const value = hashmapDS.get(key);
            visualizer.updateSteps([
                `Get: ${key}`,
                value ? `Found value: ${value}` : `Key not found`,
                `Hash function determines bucket to search`,
                `O(1) average lookup time`
            ], 'hashmapSteps');
        }
    });

    document.getElementById('hashmapRemove').addEventListener('click', () => {
        const key = document.getElementById('hashmapKey').value;
        if (key) {
            hashmapDS.remove(key);
            visualizer.renderHashMap(hashmapDS, 'hashmapBuckets');
            visualizer.updateSteps([
                `Removed: ${key}`,
                `Entry removed from hash table`,
                `O(1) average removal time`
            ], 'hashmapSteps');
        }
    });

    document.getElementById('hashmapClear').addEventListener('click', () => {
        hashmapDS.clear();
        visualizer.renderHashMap(hashmapDS, 'hashmapBuckets');
        visualizer.updateSteps('HashMap cleared', 'hashmapSteps');
    });

    // LinkedList Controls
    document.getElementById('linkedlistAppend').addEventListener('click', () => {
        const value = document.getElementById('linkedlistValue').value;
        if (value) {
            linkedlistDS.append({ name: value });
            visualizer.renderLinkedList(linkedlistDS, 'linkedlistChain');
            visualizer.updateSteps([
                `Appended: "${value}"`,
                `Added to the end of the list`,
                `List length: ${linkedlistDS.size()}`
            ], 'linkedlistSteps');
            document.getElementById('linkedlistValue').value = '';
        }
    });

    document.getElementById('linkedlistDelete').addEventListener('click', () => {
        const value = document.getElementById('linkedlistValue').value;
        if (value) {
            linkedlistDS.delete({ name: value });
            visualizer.renderLinkedList(linkedlistDS, 'linkedlistChain');
            visualizer.updateSteps([
                `Deleted first occurrence of: "${value}"`,
                `Adjusted pointers to maintain list structure`,
                `Time complexity: O(n)`
            ], 'linkedlistSteps');
        }
    });

    document.getElementById('linkedlistReverse').addEventListener('click', () => {
        linkedlistDS.reverse();
        visualizer.renderLinkedList(linkedlistDS, 'linkedlistChain');
        visualizer.updateSteps([
            `List reversed`,
            `All pointers redirected in opposite direction`,
            `Head and tail swapped`
        ], 'linkedlistSteps');
    });

    document.getElementById('linkedlistClear').addEventListener('click', () => {
        linkedlistDS.clear();
        visualizer.renderLinkedList(linkedlistDS, 'linkedlistChain');
        visualizer.updateSteps('List cleared', 'linkedlistSteps');
    });

    // Education Navigation
    document.querySelectorAll('.edu-nav-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            switchEducationModule(e.target.dataset.module);
        });
    });
}

// ===================================
// TAB SWITCHING
// ===================================

function switchTab(tabName) {
    // Update tab buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.tab === tabName) {
            btn.classList.add('active');
        }
    });

    // Update tab content
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    document.getElementById(tabName).classList.add('active');
}

function switchDSA(dsName) {
    // Update navigation
    document.querySelectorAll('.dsa-nav-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.ds === dsName) {
            btn.classList.add('active');
        }
    });

    // Update content
    document.querySelectorAll('.dsa-container').forEach(container => {
        container.classList.remove('active');
    });
    document.getElementById(`ds-${dsName}`).classList.add('active');
}

function switchEducationModule(moduleName) {
    // Update navigation
    document.querySelectorAll('.edu-nav-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.module === moduleName) {
            btn.classList.add('active');
        }
    });

    // Update content
    document.querySelectorAll('.education-module').forEach(module => {
        module.classList.remove('active');
    });
    document.getElementById(`module-${moduleName}`).classList.add('active');
}

// ===================================
// TASK CREATION
// ===================================

function createManualTask() {
    const taskData = {
        name: document.getElementById('taskName').value,
        priority: document.getElementById('taskPriority').value,
        cpu: document.getElementById('taskCpu').value,
        ram: document.getElementById('taskRam').value,
        arrivalTime: document.getElementById('taskArrival').value,
        deadline: document.getElementById('taskDeadline').value,
        category: document.getElementById('taskCategory').value
    };

    const errors = Utils.validateTask(taskData);
    if (errors.length > 0) {
        visualizer.addAlert(errors.join(', '), 'error');
        return;
    }

    const task = scheduler.addTask(taskData);
    const card = visualizer.createTaskCard(task);
    document.getElementById('taskPool').appendChild(card);

    // Add to priority queue visualization
    visualizer.renderQueue(new Queue(), 'priorityQueue');
    
    visualizer.addLog(`Created task: ${task.name}`, 'success');
    
    // Reset form
    document.getElementById('manualTaskForm').reset();
}

function generateBulkTasks() {
    const count = parseInt(document.getElementById('bulkCount').value);
    const pattern = document.getElementById('bulkPattern').value;

    const tasks = scheduler.addBulkTasks(count, pattern);
    
    tasks.forEach(task => {
        const card = visualizer.createTaskCard(task);
        document.getElementById('taskPool').appendChild(card);
    });

    visualizer.addLog(`Generated ${count} tasks with ${pattern} pattern`, 'success');
}

// ===================================
// SIMULATION CONTROL
// ===================================

function startSimulation() {
    if (simulationRunning) return;

    // Move tasks from pool to queue
    const taskCards = document.querySelectorAll('#taskPool .task-card');
    taskCards.forEach(card => {
        const taskId = parseInt(card.dataset.taskId);
        // Tasks are already in scheduler.taskQueue
    });

    simulationRunning = true;
    document.getElementById('statusText').textContent = 'RUNNING';
    document.getElementById('statusIndicator').style.background = 'rgba(0, 255, 136, 0.1)';
    document.getElementById('startSimBtn').disabled = true;
    document.getElementById('pauseSimBtn').disabled = false;

    visualizer.addLog('Simulation started', 'success');

    simulationInterval = setInterval(() => {
        runSimulationStep();
    }, 1000 / simulationSpeed);
}

function pauseSimulation() {
    simulationRunning = false;
    clearInterval(simulationInterval);
    
    document.getElementById('statusText').textContent = 'PAUSED';
    document.getElementById('statusIndicator').style.background = 'rgba(255, 149, 0, 0.1)';
    document.getElementById('startSimBtn').disabled = false;
    document.getElementById('pauseSimBtn').disabled = true;

    visualizer.addLog('Simulation paused', 'warning');
}

function resetSimulation() {
    pauseSimulation();
    
    scheduler.reset();
    scheduler.initServers(4);
    
    // Clear visualizations
    document.getElementById('taskPool').innerHTML = '';
    visualizer.renderQueue(new Queue(), 'priorityQueue');
    visualizer.renderQueue(new Queue(), 'waitingQueue');
    visualizer.renderServerGrid(scheduler.servers, 'serverGrid');
    document.getElementById('completedTimeline').innerHTML = '';
    
    // Reset KPIs
    updateKPIs();
    
    document.getElementById('statusText').textContent = 'READY';
    document.getElementById('statusIndicator').style.background = 'rgba(0, 255, 136, 0.1)';
    document.getElementById('startSimBtn').disabled = false;
    document.getElementById('pauseSimBtn').disabled = true;

    visualizer.addLog('Simulation reset', 'info');
}

function runSimulationStep() {
    scheduler.simulateStep(1 / simulationSpeed);
    
    // Update visualizations
    visualizer.renderServerGrid(scheduler.servers, 'serverGrid');
    
    // Update queues
    const priorityQueue = new Queue();
    scheduler.taskQueue.forEach(t => priorityQueue.enqueue(t));
    visualizer.renderQueue(priorityQueue, 'priorityQueue');
    
    // Add completed tasks to timeline
    scheduler.completedTasks.forEach(task => {
        if (!task.addedToTimeline) {
            visualizer.addTimelineItem(task, 'completedTimeline');
            task.addedToTimeline = true;
            
            // Integration updates
            updateIntegration('linkedlist', `Task "${task.name}" completed`);
        }
    });
    
    // Update KPIs
    updateKPIs();
    
    // Update charts
    updateCharts();
    
    // Check for alerts
    checkAlerts();
}

function updateKPIs() {
    const metrics = scheduler.getMetrics();
    
    document.getElementById('kpiTotal').textContent = metrics.totalTasks;
    document.getElementById('kpiCompleted').textContent = metrics.completedTasks;
    document.getElementById('kpiWait').textContent = metrics.avgWaitTime + 's';
    document.getElementById('kpiThroughput').textContent = metrics.throughput + '/s';
}

function checkAlerts() {
    scheduler.servers.forEach(server => {
        const status = server.getStatus();
        if (status === 'danger' && Math.random() < 0.1) {
            visualizer.addAlert(`${server.name} is overloaded!`, 'error');
        } else if (status === 'warning' && Math.random() < 0.05) {
            visualizer.addAlert(`${server.name} load is high`, 'warning');
        }
    });
}

// ===================================
// AUTO DEMO
// ===================================

function runAutoDemo() {
    resetSimulation();
    
    visualizer.addLog('Starting auto demo...', 'info');
    
    // Generate demo tasks
    const tasks = scheduler.addBulkTasks(15, 'normal');
    tasks.forEach(task => {
        const card = visualizer.createTaskCard(task);
        document.getElementById('taskPool').appendChild(card);
    });
    
    setTimeout(() => {
        startSimulation();
    }, 1000);
}

// ===================================
// CHARTS
// ===================================

function initializeCharts() {
    const chartConfig = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false
            }
        },
        scales: {
            x: {
                grid: {
                    color: 'rgba(255, 255, 255, 0.1)'
                },
                ticks: {
                    color: '#a0aec0'
                }
            },
            y: {
                grid: {
                    color: 'rgba(255, 255, 255, 0.1)'
                },
                ticks: {
                    color: '#a0aec0'
                }
            }
        }
    };

    // Wait Time Chart
    charts.waitTime = new Chart(document.getElementById('waitTimeChart'), {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'Wait Time',
                data: [],
                borderColor: '#00f3ff',
                backgroundColor: 'rgba(0, 243, 255, 0.1)',
                tension: 0.4
            }]
        },
        options: chartConfig
    });

    // Throughput Chart
    charts.throughput = new Chart(document.getElementById('throughputChart'), {
        type: 'bar',
        data: {
            labels: [],
            datasets: [{
                label: 'Throughput',
                data: [],
                backgroundColor: '#8b5cf6'
            }]
        },
        options: chartConfig
    });

    // Load Distribution Chart
    charts.loadDist = new Chart(document.getElementById('loadDistChart'), {
        type: 'pie',
        data: {
            labels: ['Server 0', 'Server 1', 'Server 2', 'Server 3'],
            datasets: [{
                data: [25, 25, 25, 25],
                backgroundColor: ['#00f3ff', '#ff006e', '#8b5cf6', '#00ff88']
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        color: '#a0aec0'
                    }
                }
            }
        }
    });

    // Response Time Chart
    charts.responseTime = new Chart(document.getElementById('responseTimeChart'), {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'Response Time',
                data: [],
                borderColor: '#00ff88',
                backgroundColor: 'rgba(0, 255, 136, 0.1)',
                fill: true,
                tension: 0.4
            }]
        },
        options: chartConfig
    });
}

function updateCharts() {
    const metrics = scheduler.getMetrics();
    const time = Math.floor(scheduler.currentTime);
    
    // Update Wait Time Chart
    if (charts.waitTime.data.labels.length > 20) {
        charts.waitTime.data.labels.shift();
        charts.waitTime.data.datasets[0].data.shift();
    }
    charts.waitTime.data.labels.push(time + 's');
    charts.waitTime.data.datasets[0].data.push(parseFloat(metrics.avgWaitTime));
    charts.waitTime.update('none');
    
    // Update Throughput Chart
    if (charts.throughput.data.labels.length > 10) {
        charts.throughput.data.labels.shift();
        charts.throughput.data.datasets[0].data.shift();
    }
    charts.throughput.data.labels.push(time + 's');
    charts.throughput.data.datasets[0].data.push(parseFloat(metrics.throughput) * 10);
    charts.throughput.update('none');
    
    // Update Load Distribution
    const serverLoads = scheduler.servers.map(s => s.getLoad() * 100);
    charts.loadDist.data.datasets[0].data = serverLoads;
    charts.loadDist.update('none');
    
    // Update Response Time Chart
    if (charts.responseTime.data.labels.length > 20) {
        charts.responseTime.data.labels.shift();
        charts.responseTime.data.datasets[0].data.shift();
    }
    charts.responseTime.data.labels.push(time + 's');
    const avgResponse = scheduler.completedTasks.length > 0 
        ? Utils.average(scheduler.completedTasks.map(t => t.getTurnaroundTime()))
        : 0;
    charts.responseTime.data.datasets[0].data.push(avgResponse);
    charts.responseTime.update('none');
}

// ===================================
// SYSTEM MONITORS
// ===================================

function startClock() {
    setInterval(() => {
        const now = new Date();
        document.getElementById('liveClock').textContent = now.toLocaleTimeString();
    }, 1000);
}

function startSystemMonitors() {
    setInterval(() => {
        // Simulate CPU and RAM usage
        if (simulationRunning) {
            const avgLoad = scheduler.servers.reduce((sum, s) => sum + s.getLoad(), 0) / scheduler.servers.length;
            cpuUsage = Math.min(avgLoad * 100, 100);
            ramUsage = Math.min((avgLoad * 0.8) * 100, 100);
        } else {
            cpuUsage = Math.max(cpuUsage - 5, 0);
            ramUsage = Math.max(ramUsage - 5, 0);
        }
        
        document.getElementById('cpuMonitor').style.width = cpuUsage + '%';
        document.getElementById('cpuValue').textContent = Math.floor(cpuUsage) + '%';
        document.getElementById('ramMonitor').style.width = ramUsage + '%';
        document.getElementById('ramValue').textContent = Math.floor(ramUsage) + '%';
    }, 500);
}

// ===================================
// INTEGRATION UPDATES
// ===================================

function updateIntegration(dsType, message) {
    const syncId = `sync${dsType.charAt(0).toUpperCase() + dsType.slice(1)}`;
    const lastSyncId = `lastSync${dsType.charAt(0).toUpperCase() + dsType.slice(1)}`;
    
    // Pulse animation
    const indicator = document.getElementById(syncId);
    if (indicator) {
        const pulse = indicator.querySelector('.sync-pulse');
        pulse.style.animation = 'none';
        setTimeout(() => {
            pulse.style.animation = 'pulse 2s ease-in-out infinite';
        }, 10);
    }
    
    // Update last sync
    const lastSync = document.getElementById(lastSyncId);
    if (lastSync) {
        lastSync.textContent = message;
    }
    
    // Add to events log
    const eventsContainer = document.getElementById('integrationEvents');
    if (eventsContainer) {
        const entry = document.createElement('div');
        entry.className = 'event-entry';
        entry.textContent = `[${new Date().toLocaleTimeString()}] ${dsType.toUpperCase()}: ${message}`;
        eventsContainer.insertBefore(entry, eventsContainer.firstChild);
        
        while (eventsContainer.children.length > 50) {
            eventsContainer.removeChild(eventsContainer.lastChild);
        }
    }
}

// ===================================
// INITIAL RENDERS
// ===================================

// Initial DSA renders
visualizer.renderHeap(heapDS, 'heapTree');
visualizer.renderQueueLane(queueDS);
visualizer.renderBST(bstDS, 'bstTree');
visualizer.renderHashMap(hashmapDS, 'hashmapBuckets');
visualizer.renderLinkedList(linkedlistDS, 'linkedlistChain');
