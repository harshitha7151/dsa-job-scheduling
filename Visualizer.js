/**
 * Visualizer.js
 * Handles all UI visualizations and rendering
 */

class Visualizer {
    constructor() {
        this.logs = [];
        this.maxLogs = 100;
    }

    renderServerGrid(servers, containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        container.innerHTML = '';

        servers.forEach(server => {
            const serverDiv = document.createElement('div');
            serverDiv.className = `server-card ${server.getStatus()}`;

            const tasksCount = (server.runningTask ? 1 : 0) + (server.queue ? server.queue.length : 0);
            const capacity = 3;

            serverDiv.innerHTML = `
                <div class="server-top">
                    <div class="server-left">
                        <span class="status-dot ${server.getStatus()}"></span>
                        <span class="server-name">${server.name}</span>
                    </div>
                    <div class="server-right">
                        <span class="server-count">${tasksCount}/${capacity}</span>
                    </div>
                </div>

                <div class="server-bars">
                    <div class="bar-row">
                        <span class="bar-icon">⚙️</span>
                        <div class="bar-track"><div class="bar-fill" style="width: ${Math.round(server.cpuUsage)}%"></div></div>
                        <span class="bar-value">${Math.round(server.cpuUsage)}%</span>
                    </div>

                    <div class="bar-row">
                        <span class="bar-icon">🗄️</span>
                        <div class="bar-track"><div class="bar-fill" style="width: ${Math.round(server.ramUsage)}%"></div></div>
                        <span class="bar-value">${Math.round(server.ramUsage)}%</span>
                    </div>
                </div>
            `;

            container.appendChild(serverDiv);
        });
    }

    createTaskCard(task) {
        const card = document.createElement('div');
        card.className = 'task-card';
        card.dataset.taskId = task.id;
        card.innerHTML = `
            <div class="task-header">
                <span class="task-name">${task.name}</span>
                <span class="priority-badge priority-${task.priority}">P${task.priority}</span>
            </div>
            <div class="task-details">
                <span class="detail">CPU: ${task.cpu}%</span>
                <span class="detail">RAM: ${task.ram}MB</span>
            </div>
            <div class="task-status">${task.status}</div>
        `;
        return card;
    }

    renderQueue(queue, containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        container.innerHTML = '';
        if (queue.isEmpty()) {
            container.innerHTML = '<div class="queue-empty">Empty</div>';
            return;
        }

        let current = queue.front();
        const items = [];
        while (current && items.length < 5) {
            items.push(current);
            current = current.next;
        }

        items.forEach((item, index) => {
            const itemDiv = document.createElement('div');
            itemDiv.className = 'queue-item';
            itemDiv.innerHTML = `<span>${item.name || item}</span>`;
            container.appendChild(itemDiv);
        });
    }

    renderQueueLane(queue) {
        const container = document.getElementById('queueLane');
        if (!container) return;

        container.innerHTML = '';
        if (queue.isEmpty()) {
            container.innerHTML = '<div class="queue-empty">Empty</div>';
            return;
        }

        for (let i = 0; i < queue.items.length && i < 10; i++) {
            const itemDiv = document.createElement('div');
            itemDiv.className = 'queue-lane-item';
            itemDiv.innerHTML = `<span>${queue.items[i]}</span>`;
            container.appendChild(itemDiv);
        }
    }

    renderHeap(heap, containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        container.innerHTML = '';
        if (heap.heap.length === 0) {
            container.innerHTML = '<div class="tree-empty">Empty</div>';
            return;
        }

        const heapDiv = document.createElement('div');
        heapDiv.className = 'heap-tree';
        this._renderHeapNodes(heap.heap, heapDiv, 0);
        container.appendChild(heapDiv);
    }

    _renderHeapNodes(heap, container, index) {
        if (index >= heap.length) return;

        const nodeDiv = document.createElement('div');
        nodeDiv.className = 'tree-node';
        nodeDiv.innerHTML = `<span>${heap[index].name}(${heap[index].priority})</span>`;
        container.appendChild(nodeDiv);

        const childrenDiv = document.createElement('div');
        childrenDiv.className = 'tree-children';

        const leftIndex = 2 * index + 1;
        const rightIndex = 2 * index + 2;

        if (leftIndex < heap.length) {
            this._renderHeapNodes(heap, childrenDiv, leftIndex);
        }
        if (rightIndex < heap.length) {
            this._renderHeapNodes(heap, childrenDiv, rightIndex);
        }

        if (childrenDiv.children.length > 0) {
            container.appendChild(childrenDiv);
        }
    }

    renderBST(bst, containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        container.innerHTML = '';
        if (bst.root === null) {
            container.innerHTML = '<div class="tree-empty">Empty</div>';
            return;
        }

        const treeDiv = document.createElement('div');
        treeDiv.className = 'bst-tree';
        this._renderBSTNode(bst.root, treeDiv);
        container.appendChild(treeDiv);
    }

    _renderBSTNode(node, container) {
        const nodeDiv = document.createElement('div');
        nodeDiv.className = 'tree-node';
        nodeDiv.innerHTML = `<span>${node.value}</span>`;
        container.appendChild(nodeDiv);

        const childrenDiv = document.createElement('div');
        childrenDiv.className = 'tree-children';

        if (node.left) {
            this._renderBSTNode(node.left, childrenDiv);
        }
        if (node.right) {
            this._renderBSTNode(node.right, childrenDiv);
        }

        if (childrenDiv.children.length > 0) {
            container.appendChild(childrenDiv);
        }
    }

    renderHashMap(hashmap, containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        container.innerHTML = '';
        hashmap.buckets.forEach((bucket, index) => {
            const bucketDiv = document.createElement('div');
            bucketDiv.className = 'hashmap-bucket';
            bucketDiv.innerHTML = `<div class="bucket-index">${index}</div>`;

            if (bucket.length > 0) {
                bucket.forEach(([key, value]) => {
                    const itemDiv = document.createElement('div');
                    itemDiv.className = 'bucket-item';
                    itemDiv.innerHTML = `<span>${key}: ${value}</span>`;
                    bucketDiv.appendChild(itemDiv);
                });
            } else {
                const emptyDiv = document.createElement('div');
                emptyDiv.className = 'bucket-empty';
                emptyDiv.innerHTML = '∅';
                bucketDiv.appendChild(emptyDiv);
            }

            container.appendChild(bucketDiv);
        });
    }

    renderLinkedList(linkedlist, containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        container.innerHTML = '';
        if (linkedlist.head === null) {
            container.innerHTML = '<div class="list-empty">Empty</div>';
            return;
        }

        let current = linkedlist.head;
        let index = 0;
        while (current && index < 20) {
            const nodeDiv = document.createElement('div');
            nodeDiv.className = 'list-node';
            nodeDiv.innerHTML = `<span>${current.data.name || current.data}</span>`;
            container.appendChild(nodeDiv);

            if (current.next) {
                const arrowDiv = document.createElement('div');
                arrowDiv.className = 'list-arrow';
                arrowDiv.innerHTML = '→';
                container.appendChild(arrowDiv);
            }

            current = current.next;
            index++;
        }

        const nullDiv = document.createElement('div');
        nullDiv.className = 'list-null';
        nullDiv.innerHTML = 'null';
        container.appendChild(nullDiv);
    }

    updateSteps(steps, containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        container.innerHTML = '';

        if (typeof steps === 'string') {
            const stepDiv = document.createElement('div');
            stepDiv.className = 'step-item';
            stepDiv.innerHTML = `<span>${steps}</span>`;
            container.appendChild(stepDiv);
        } else if (Array.isArray(steps)) {
            steps.forEach(step => {
                const stepDiv = document.createElement('div');
                stepDiv.className = 'step-item';
                stepDiv.innerHTML = `<span>${step}</span>`;
                container.appendChild(stepDiv);
            });
        }
    }

    addTimelineItem(task, containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const itemDiv = document.createElement('div');
        itemDiv.className = 'timeline-item completed';
        itemDiv.innerHTML = `
            <div class="timeline-marker"></div>
            <div class="timeline-content">
                <span class="timeline-title">${task.name}</span>
                <span class="timeline-info">Completed at ${task.endTime ? task.endTime.toFixed(2) : 'N/A'}s</span>
            </div>
        `;
        container.insertBefore(itemDiv, container.firstChild);

        while (container.children.length > 50) {
            container.removeChild(container.lastChild);
        }
    }

    addLog(message, type = 'info') {
        this.logs.push({ message, type, timestamp: new Date() });

        const logContainer = document.getElementById('systemLogs');
        if (logContainer) {
            const logDiv = document.createElement('div');
            logDiv.className = `log-entry log-${type}`;
            logDiv.innerHTML = `
                <span class="log-time">${new Date().toLocaleTimeString()}</span>
                <span class="log-message">${message}</span>
            `;
            logContainer.insertBefore(logDiv, logContainer.firstChild);

            while (logContainer.children.length > this.maxLogs) {
                logContainer.removeChild(logContainer.lastChild);
            }
        }
    }

    addAlert(message, type = 'info') {
        const alertContainer = document.getElementById('alerts');
        if (!alertContainer) return;

        const alertDiv = document.createElement('div');
        alertDiv.className = `alert alert-${type}`;
        alertDiv.innerHTML = `
            <span>${message}</span>
            <button class="alert-close">×</button>
        `;

        alertDiv.querySelector('.alert-close').addEventListener('click', () => {
            alertDiv.remove();
        });

        alertContainer.appendChild(alertDiv);

        setTimeout(() => {
            if (alertDiv.parentElement) {
                alertDiv.remove();
            }
        }, 5000);
    }
}
