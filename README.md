# ABC-TSP | Swarm Intelligence Route Optimizer

[![Live Demo](https://img.shields.io/badge/demo-live-10b981?style=for-the-badge)](https://abc-tsp.vercel.app)
[![GitHub](https://img.shields.io/badge/source-github-1f2937?style=for-the-badge)](https://github.com/blamairia/abc-tsp)

> 🐝 **Artificial Bee Colony algorithm for solving the Traveling Salesman Problem** — A premium, interactive visualization built with vanilla JavaScript and HTML5 Canvas.

![ABC-TSP Demo](https://raw.githubusercontent.com/blamairia/abc-tsp/main/docs/preview.png)

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 🎨 **TERMINUS Design** | Dark/light mode with emerald accents, scanlines, and glow effects |
| 🐝 **Visual Bees** | Animated bees flying along paths, color-coded by role |
| 📊 **Real-time Metrics** | Live iteration count, best distance, improvements |
| ⚡ **Adjustable Parameters** | Speed control, city count slider |
| 📱 **Responsive** | Works on desktop and mobile |
| 🌓 **Theme Toggle** | System preference detection + localStorage |

---

## 🧠 Algorithm Overview

The **Artificial Bee Colony (ABC)** algorithm simulates honey bee foraging behavior:

| Bee Type | Role | Behavior |
|----------|------|----------|
| 🟡 **Forager** | Exploit | Refines its own path by swapping cities |
| 🔵 **Onlooker** | Follow | Selects good paths probabilistically, then refines |
| 🩷 **Scout** | Explore | Generates completely new random paths |

### Workflow
1. **Initialize** random paths for all bees
2. **Forager phase**: Each forager mutates its path
3. **Onlooker phase**: Onlookers select via roulette wheel, then mutate
4. **Scout phase**: Scouts generate new random paths
5. **Update** global best if improvement found
6. **Repeat** for N iterations

---

## 🚀 Quick Start

### Live Demo
👉 **[abc-tsp.vercel.app](https://abc-tsp.vercel.app)**

### Run Locally
```bash
# Clone the repo
git clone https://github.com/blamairia/abc-tsp.git
cd abc-tsp/static-demo

# Serve with any HTTP server
python3 -m http.server 8888
# or
npx serve .
```

Open `http://localhost:8888` in your browser.

---

## 🎛️ Controls

| Control | Description |
|---------|-------------|
| ▶️ **Start/Pause** | Run or pause the algorithm |
| ↻ **Reset** | Generate new random cities |
| 🔧 **Speed** | 1x - 5x iteration speed |
| 📍 **Cities** | 5 - 15 cities to optimize |
| 🌓 **Theme** | Toggle light/dark mode |

---

## 📁 Project Structure

```
abc-tsp/
├── static-demo/
│   ├── index.html      # Main HTML with TERMINUS layout
│   ├── style.css       # CSS with dark/light theme support
│   └── simulation.js   # ABC algorithm + Canvas rendering
├── simulation.js       # Original algorithm-visualizer version
└── README.md
```

---

## 📖 References

- [Artificial Bee Colony Algorithm](https://en.wikipedia.org/wiki/Artificial_bee_colony_algorithm)
- [Traveling Salesman Problem](https://en.wikipedia.org/wiki/Travelling_salesman_problem)

---

## 👨‍💻 Author

Built by **[Billel Lamairia](https://blamairia.me)**

[![LinkedIn](https://img.shields.io/badge/LinkedIn-0077B5?style=flat&logo=linkedin)](https://www.linkedin.com/in/billel-lamairia-94141723b)
[![Email](https://img.shields.io/badge/Email-EA4335?style=flat&logo=gmail&logoColor=white)](mailto:blamairia@gmail.com)

---

## 📄 License

MIT License — Feel free to use and modify!
