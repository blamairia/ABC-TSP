/**
 * TERMINUS ABC-TSP Visualization
 * Artificial Bee Colony algorithm for Traveling Salesman Problem
 * Premium canvas-based visualization
 */

class ABCTSPSimulation {
    constructor() {
        this.canvas = document.getElementById('tspCanvas');
        this.ctx = this.canvas.getContext('2d');

        // Responsive canvas sizing
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());

        // Colors
        this.colors = {
            bg: '#0a0f1a',
            primary: '#10b981',
            primaryGlow: 'rgba(16, 185, 129, 0.5)',
            forager: '#fbbf24',
            onlooker: '#22d3ee',
            scout: '#f472b6',
            path: 'rgba(255, 255, 255, 0.15)',
            bestPath: '#10b981',
            node: '#10b981',
            nodeGlow: 'rgba(16, 185, 129, 0.6)'
        };

        // Algorithm parameters
        this.numCities = 8;
        this.numForagers = 2;
        this.numOnlookers = 4;
        this.numScouts = 4;
        this.speed = 2;

        // State
        this.cities = [];
        this.bees = [];
        this.globalBestPath = null;
        this.globalBestDistance = Infinity;
        this.iteration = 0;
        this.improvements = 0;
        this.isRunning = false;
        this.animationId = null;

        // Animation state
        this.beeAnimations = [];
        this.lastFrameTime = 0;

        // Initialize
        this.bindControls();
        this.reset();
    }

    resizeCanvas() {
        const container = this.canvas.parentElement;
        this.canvas.width = container.clientWidth;
        this.canvas.height = container.clientHeight;
        this.padding = 60;
        if (this.cities && this.cities.length > 0) this.render();
    }

    bindControls() {
        document.getElementById('startBtn').addEventListener('click', () => this.toggleRun());
        document.getElementById('resetBtn').addEventListener('click', () => this.reset());

        document.getElementById('speedSlider').addEventListener('input', (e) => {
            this.speed = parseInt(e.target.value);
            document.getElementById('speedValue').textContent = `${this.speed}x`;
        });

        document.getElementById('citiesSlider').addEventListener('input', (e) => {
            this.numCities = parseInt(e.target.value);
            document.getElementById('citiesValue').textContent = this.numCities;
            if (!this.isRunning) this.reset();
        });
    }

    // Generate random cities
    generateCities() {
        this.cities = [];
        const w = this.canvas.width - this.padding * 2;
        const h = this.canvas.height - this.padding * 2;

        for (let i = 0; i < this.numCities; i++) {
            this.cities.push({
                id: i,
                x: this.padding + Math.random() * w,
                y: this.padding + Math.random() * h,
                pulse: Math.random() * Math.PI * 2 // Phase offset for pulsing
            });
        }
    }

    // Calculate distance between two cities
    distance(city1, city2) {
        const dx = city2.x - city1.x;
        const dy = city2.y - city1.y;
        return Math.sqrt(dx * dx + dy * dy);
    }

    // Calculate total path distance
    pathDistance(path) {
        let total = 0;
        for (let i = 0; i < path.length - 1; i++) {
            total += this.distance(this.cities[path[i]], this.cities[path[i + 1]]);
        }
        total += this.distance(this.cities[path[path.length - 1]], this.cities[path[0]]);
        return total;
    }

    // Generate random path
    randomPath() {
        const path = Array.from({ length: this.numCities }, (_, i) => i);
        for (let i = path.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [path[i], path[j]] = [path[j], path[i]];
        }
        return path;
    }

    // Mutate path (swap two cities)
    mutatePath(path) {
        const newPath = [...path];
        const i = Math.floor(Math.random() * path.length);
        let j = Math.floor(Math.random() * path.length);
        while (j === i) j = Math.floor(Math.random() * path.length);
        [newPath[i], newPath[j]] = [newPath[j], newPath[i]];
        return newPath;
    }

    // Initialize bees
    initializeBees() {
        this.bees = [];
        const totalBees = this.numForagers + this.numOnlookers + this.numScouts;

        for (let i = 0; i < totalBees; i++) {
            let role;
            if (i < this.numForagers) role = 'forager';
            else if (i < this.numForagers + this.numOnlookers) role = 'onlooker';
            else role = 'scout';

            const path = this.randomPath();
            this.bees.push({
                id: i,
                role,
                path,
                distance: this.pathDistance(path),
                position: 0, // Current position along path for animation
                speed: 0.5 + Math.random() * 0.5
            });
        }

        // Update global best
        this.updateGlobalBest();
    }

    // Roulette wheel selection
    rouletteSelect() {
        const fitness = this.bees.map(b => 1 / b.distance);
        const total = fitness.reduce((a, b) => a + b, 0);
        const normalized = fitness.map(f => f / total);

        const rand = Math.random();
        let cumulative = 0;
        for (let i = 0; i < normalized.length; i++) {
            cumulative += normalized[i];
            if (rand < cumulative) return i;
        }
        return this.bees.length - 1;
    }

    // Update global best
    updateGlobalBest() {
        for (const bee of this.bees) {
            if (bee.distance < this.globalBestDistance) {
                this.globalBestDistance = bee.distance;
                this.globalBestPath = [...bee.path];
                this.improvements++;
            }
        }
    }

    // Run one iteration
    runIteration() {
        this.iteration++;

        for (let i = 0; i < this.bees.length; i++) {
            const bee = this.bees[i];
            let newPath;

            switch (bee.role) {
                case 'forager':
                    // Exploit: mutate own path
                    newPath = this.mutatePath(bee.path);
                    break;

                case 'onlooker':
                    // Follow: select and mutate good path
                    const selectedIdx = this.rouletteSelect();
                    newPath = this.mutatePath(this.bees[selectedIdx].path);
                    break;

                case 'scout':
                    // Explore: random new path
                    newPath = this.randomPath();
                    break;
            }

            const newDistance = this.pathDistance(newPath);

            // Greedy selection
            if (newDistance < bee.distance) {
                bee.path = newPath;
                bee.distance = newDistance;
            }
        }

        this.updateGlobalBest();
        this.updateUI();
    }

    // Update UI elements
    updateUI() {
        document.getElementById('iteration').textContent = this.iteration;
        document.getElementById('bestDistance').textContent = this.globalBestDistance.toFixed(1);
        document.getElementById('globalBest').textContent = this.globalBestDistance.toFixed(1);

        const avgDist = this.bees.reduce((sum, b) => sum + b.distance, 0) / this.bees.length;
        document.getElementById('avgDistance').textContent = avgDist.toFixed(1);
        document.getElementById('improvements').textContent = this.improvements;
    }

    // Render everything
    render(timestamp = 0) {
        const dt = timestamp - this.lastFrameTime;
        this.lastFrameTime = timestamp;

        const ctx = this.ctx;
        const w = this.canvas.width;
        const h = this.canvas.height;

        // Clear
        ctx.fillStyle = this.colors.bg;
        ctx.fillRect(0, 0, w, h);

        // Draw grid
        this.drawGrid();

        // Draw all bee paths (dimmed)
        for (const bee of this.bees) {
            this.drawPath(bee.path, this.colors.path, 1);
        }

        // Draw best path (highlighted)
        if (this.globalBestPath) {
            this.drawPath(this.globalBestPath, this.colors.bestPath, 3, true);
        }

        // Draw cities
        this.drawCities(timestamp);

        // Draw bees
        this.drawBees(timestamp);

        // Continue animation
        if (this.isRunning) {
            this.animationId = requestAnimationFrame((t) => this.render(t));
        }
    }

    drawGrid() {
        const ctx = this.ctx;
        const w = this.canvas.width;
        const h = this.canvas.height;
        const gridSize = 50;

        ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
        ctx.lineWidth = 1;

        for (let x = 0; x < w; x += gridSize) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, h);
            ctx.stroke();
        }

        for (let y = 0; y < h; y += gridSize) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(w, y);
            ctx.stroke();
        }
    }

    drawPath(path, color, width, glow = false) {
        const ctx = this.ctx;

        if (glow) {
            ctx.shadowColor = color;
            ctx.shadowBlur = 15;
        }

        ctx.beginPath();
        ctx.strokeStyle = color;
        ctx.lineWidth = width;

        const first = this.cities[path[0]];
        ctx.moveTo(first.x, first.y);

        for (let i = 1; i < path.length; i++) {
            const city = this.cities[path[i]];
            ctx.lineTo(city.x, city.y);
        }

        ctx.lineTo(first.x, first.y); // Close loop
        ctx.stroke();

        ctx.shadowBlur = 0;
    }

    drawCities(timestamp) {
        const ctx = this.ctx;

        for (const city of this.cities) {
            // Pulsing effect
            const pulse = Math.sin(timestamp / 500 + city.pulse) * 0.3 + 1;
            const radius = 8 * pulse;

            // Glow
            const gradient = ctx.createRadialGradient(
                city.x, city.y, 0,
                city.x, city.y, radius * 3
            );
            gradient.addColorStop(0, this.colors.nodeGlow);
            gradient.addColorStop(1, 'transparent');

            ctx.beginPath();
            ctx.arc(city.x, city.y, radius * 3, 0, Math.PI * 2);
            ctx.fillStyle = gradient;
            ctx.fill();

            // Node
            ctx.beginPath();
            ctx.arc(city.x, city.y, radius, 0, Math.PI * 2);
            ctx.fillStyle = this.colors.node;
            ctx.fill();

            // Label
            ctx.fillStyle = '#fff';
            ctx.font = '12px JetBrains Mono';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(city.id, city.x, city.y);
        }
    }

    drawBees(timestamp) {
        const ctx = this.ctx;

        for (const bee of this.bees) {
            // Animate bee along its path
            bee.position += bee.speed * this.speed * 0.01;
            if (bee.position >= bee.path.length) bee.position = 0;

            const pathIdx = Math.floor(bee.position);
            const t = bee.position - pathIdx;

            const fromCity = this.cities[bee.path[pathIdx]];
            const toCity = this.cities[bee.path[(pathIdx + 1) % bee.path.length]];

            const x = fromCity.x + (toCity.x - fromCity.x) * t;
            const y = fromCity.y + (toCity.y - fromCity.y) * t;

            // Bee color based on role
            let color;
            switch (bee.role) {
                case 'forager': color = this.colors.forager; break;
                case 'onlooker': color = this.colors.onlooker; break;
                case 'scout': color = this.colors.scout; break;
            }

            // Glow
            ctx.shadowColor = color;
            ctx.shadowBlur = 10;

            // Draw bee
            ctx.beginPath();
            ctx.arc(x, y, 5, 0, Math.PI * 2);
            ctx.fillStyle = color;
            ctx.fill();

            ctx.shadowBlur = 0;
        }
    }

    // Toggle running
    toggleRun() {
        if (this.isRunning) {
            this.stop();
        } else {
            this.start();
        }
    }

    start() {
        this.isRunning = true;
        document.getElementById('startBtn').innerHTML = '<span class="btn-icon">⏸</span> PAUSE';

        // Start iteration loop
        this.iterationLoop = setInterval(() => {
            this.runIteration();
        }, 500 / this.speed);

        // Start render loop
        this.animationId = requestAnimationFrame((t) => this.render(t));
    }

    stop() {
        this.isRunning = false;
        document.getElementById('startBtn').innerHTML = '<span class="btn-icon">▶</span> START';

        if (this.iterationLoop) clearInterval(this.iterationLoop);
        if (this.animationId) cancelAnimationFrame(this.animationId);
    }

    reset() {
        this.stop();

        this.iteration = 0;
        this.improvements = 0;
        this.globalBestPath = null;
        this.globalBestDistance = Infinity;

        this.generateCities();
        this.initializeBees();
        this.updateUI();

        // Initial render
        requestAnimationFrame((t) => {
            this.render(t);
        });
    }
}

// Initialize on load
document.addEventListener('DOMContentLoaded', () => {
    window.simulation = new ABCTSPSimulation();
});

/**
 * Theme Controller
 * Handles light/dark mode with system preference detection and localStorage persistence
 */
class ThemeController {
    constructor() {
        this.toggle = document.getElementById('themeToggle');
        this.prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
        
        // Initialize theme
        this.initTheme();
        
        // Bind events
        this.toggle.addEventListener('click', () => this.toggleTheme());
        this.prefersDark.addEventListener('change', (e) => this.handleSystemChange(e));
    }
    
    initTheme() {
        // Check localStorage first
        const savedTheme = localStorage.getItem('abc-tsp-theme');
        
        if (savedTheme) {
            this.setTheme(savedTheme);
        } else {
            // Use system preference
            this.setTheme(this.prefersDark.matches ? 'dark' : 'light');
        }
    }
    
    setTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        this.currentTheme = theme;
        
        // Update simulation colors if it exists
        if (window.simulation) {
            window.simulation.updateThemeColors(theme);
        }
    }
    
    toggleTheme() {
        const newTheme = this.currentTheme === 'dark' ? 'light' : 'dark';
        this.setTheme(newTheme);
        localStorage.setItem('abc-tsp-theme', newTheme);
    }
    
    handleSystemChange(e) {
        // Only update if user hasn't manually set a preference
        if (!localStorage.getItem('abc-tsp-theme')) {
            this.setTheme(e.matches ? 'dark' : 'light');
        }
    }
}

// Extend ABCTSPSimulation with theme support
ABCTSPSimulation.prototype.updateThemeColors = function(theme) {
    if (theme === 'light') {
        this.colors = {
            bg: '#f1f5f9',
            primary: '#059669',
            primaryGlow: 'rgba(5, 150, 105, 0.3)',
            forager: '#d97706',
            onlooker: '#0891b2',
            scout: '#db2777',
            path: 'rgba(0, 0, 0, 0.1)',
            bestPath: '#059669',
            node: '#059669',
            nodeGlow: 'rgba(5, 150, 105, 0.4)',
            grid: 'rgba(0, 0, 0, 0.04)',
            label: '#0f172a'
        };
    } else {
        this.colors = {
            bg: '#0a0f1a',
            primary: '#10b981',
            primaryGlow: 'rgba(16, 185, 129, 0.5)',
            forager: '#fbbf24',
            onlooker: '#22d3ee',
            scout: '#f472b6',
            path: 'rgba(255, 255, 255, 0.15)',
            bestPath: '#10b981',
            node: '#10b981',
            nodeGlow: 'rgba(16, 185, 129, 0.6)',
            grid: 'rgba(255, 255, 255, 0.03)',
            label: '#ffffff'
        };
    }
    
    // Re-render with new colors
    if (!this.isRunning && this.cities.length > 0) {
        requestAnimationFrame((t) => this.render(t));
    }
};

// Update drawGrid to use theme color
const originalDrawGrid = ABCTSPSimulation.prototype.drawGrid;
ABCTSPSimulation.prototype.drawGrid = function() {
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;
    const gridSize = 50;

    ctx.strokeStyle = this.colors.grid || 'rgba(255, 255, 255, 0.03)';
    ctx.lineWidth = 1;

    for (let x = 0; x < w; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
    }

    for (let y = 0; y < h; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
    }
};

// Update drawCities to use theme label color
const originalDrawCities = ABCTSPSimulation.prototype.drawCities;
ABCTSPSimulation.prototype.drawCities = function(timestamp) {
    const ctx = this.ctx;

    for (const city of this.cities) {
        const pulse = Math.sin(timestamp / 500 + city.pulse) * 0.3 + 1;
        const radius = 8 * pulse;

        const gradient = ctx.createRadialGradient(
            city.x, city.y, 0,
            city.x, city.y, radius * 3
        );
        gradient.addColorStop(0, this.colors.nodeGlow);
        gradient.addColorStop(1, 'transparent');

        ctx.beginPath();
        ctx.arc(city.x, city.y, radius * 3, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(city.x, city.y, radius, 0, Math.PI * 2);
        ctx.fillStyle = this.colors.node;
        ctx.fill();

        ctx.fillStyle = this.colors.label || '#fff';
        ctx.font = '12px JetBrains Mono';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(city.id, city.x, city.y);
    }
};

// Initialize theme controller after DOM loads
document.addEventListener('DOMContentLoaded', () => {
    window.themeController = new ThemeController();
});
