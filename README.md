# Device Compare App

📱 A sleek, modern React application for deeply comparing smartphone and tablet specifications, complete with an intelligent recommendation engine and automated comparison verdicts.

[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-B73BFE?style=for-the-badge&logo=vite&logoColor=FFD62E)](https://vitejs.dev/)

## ✨ Key Features

- **Side-by-Side Comparison Grid**: Compare up to 5 devices simultaneously.
- **Smart Recommendation Wizard**: Answer a 7-step questionnaire covering use-cases, budgets, and feature preferences (e.g., _battery life, stylus support_) to receive tailored device recommendations.
- **Automated Verdict Engine**: Using a custom heuristic algorithm, the app analyzes specs (RAM, chipset tier, battery mAh, camera MP, age) of selected devices to crown an outright "Winner" with a human-readable explanation overlay.
- **Dynamic Search Modal**: Quickly search through a mock database of device models with live-filtering.
- **Responsive & Modern UI**:
  - Glassmorphic aesthetic with smooth `framer-motion` animations.
  - Fully responsive grid adapting from ultra-wide desktops down to mobile views (max 2 devices on mobile).
  - Expandable/Collapsible summary vs detailed spec views.

## 🛠️ Tech Stack

- **Frontend Framework**: React 18
- **Build Tool**: Vite
- **Language**: TypeScript
- **Styling**: Vanilla CSS (CSS Variables, Flexbox/Grid, Media Queries)
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Routing**: Custom lightweight state-based routing

## 🚀 Getting Started

### Prerequisites

Ensure you have [Node.js](https://nodejs.org/) installed on your machine.

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/Ace-design2/compare_devices.git
   ```

2. Navigate into the project directory:

   ```bash
   cd compare_devices/my-device-compare-app
   ```

3. Install dependencies:

   ```bash
   npm install
   ```

4. Start the development server:

   ```bash
   npm run dev
   ```

5. Open your browser and navigate to the local URL provided by Vite (typically `http://localhost:5173`).

## 📁 Project Structure Overview

```
src/
├── components/          # Reusable UI elements (Button.tsx, DeviceSlot.tsx, etc.)
│   └── VerdictSection/  # The automated verdict logic overlay
├── pages/               # Main application views
│   ├── LandingPage.tsx  # Hero entry point
│   ├── ComparePage.tsx  # The core multi-device comparison grid
│   └── RecommendPage.tsx# The multi-step recommendation wizard
├── services/            # API simulation and data fetching (api.ts)
├── utils/               # Helper logic scripts
│   └── compareLogic.ts  # The heuristic evaluation engine for the Verdict feature
├── App.tsx              # Root component & basic routing
└── index.css            # Global tokens and CSS variables
```

## 🧠 How the Verdict Engine Works

The `<VerdictSection />` relies on `src/utils/compareLogic.ts`. When a user has $\ge 2$ devices on their comparison grid, clicking "View Verdict" triggers the algorithm to parse the raw string specifications. It utilizes RegEx to isolate numerical values like `5000 mAh` or `12 GB RAM` or release years, and applies weighted scores based on hardware capability to rank the devices and generate a natural language summary explaining its choice.

## 📝 License

This project is open-source and available under the [MIT License](LICENSE).
