/**
 * helpers.js
 * Utility functions and helper methods
 */

const Utils = {
    /**
     * Generates demo tasks for initial setup
     */
    generateDemoTasks() {
        const taskTemplates = [
            { name: 'DataProcess-1', priority: 2, cpu: 45, ram: 512 },
            { name: 'Analytics-1', priority: 3, cpu: 60, ram: 768 },
            { name: 'Backup-1', priority: 1, cpu: 30, ram: 256 },
            { name: 'Report-1', priority: 2, cpu: 50, ram: 512 },
            { name: 'Compute-1', priority: 3, cpu: 75, ram: 1024 },
            { name: 'Search-1', priority: 2, cpu: 55, ram: 640 },
            { name: 'Sync-1', priority: 1, cpu: 25, ram: 128 }
        ];

        return taskTemplates.map((template, index) => ({
            ...template,
            arrivalTime: 0,
            deadline: 10,
            category: ['compute', 'memory', 'network', 'mixed'][index % 4]
        }));
    },

    /**
     * Validates task data
     */
    validateTask(taskData) {
        const errors = [];

        if (!taskData.name || taskData.name.trim() === '') {
            errors.push('Task name is required');
        }

        const priority = parseInt(taskData.priority);
        if (isNaN(priority) || priority < 1 || priority > 4) {
            errors.push('Priority must be between 1 and 4');
        }

        const cpu = parseInt(taskData.cpu);
        if (isNaN(cpu) || cpu < 1 || cpu > 100) {
            errors.push('CPU must be between 1 and 100');
        }

        const ram = parseInt(taskData.ram);
        if (isNaN(ram) || ram < 100 || ram > 4096) {
            errors.push('RAM must be between 100 and 4096');
        }

        return errors;
    },

    /**
     * Calculates average of an array
     */
    average(arr) {
        if (arr.length === 0) return 0;
        return arr.reduce((a, b) => a + b, 0) / arr.length;
    },

    /**
     * Formats time in seconds to HH:MM:SS
     */
    formatTime(seconds) {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = Math.floor(seconds % 60);

        return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    },

    /**
     * Generates random color
     */
    randomColor() {
        const colors = ['#00f3ff', '#ff006e', '#8b5cf6', '#00ff88', '#ffb300', '#ff5555'];
        return colors[Math.floor(Math.random() * colors.length)];
    },

    /**
     * Clamps a value between min and max
     */
    clamp(value, min, max) {
        return Math.max(min, Math.min(max, value));
    },

    /**
     * Generates random integer between min and max
     */
    randomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    },

    /**
     * Checks if element is in viewport
     */
    isInViewport(element) {
        const rect = element.getBoundingClientRect();
        return (
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
            rect.right <= (window.innerWidth || document.documentElement.clientWidth)
        );
    }
};
