# 📻 RadioApp

A modern radio streaming application built with **React Native** and **Expo**, supporting Web, Android, and iOS platforms.

## ✨ Features

- 🎵 **Live Radio Streaming** — Stream radio stations in real-time
- 📡 **Multiple Stations** — Browse and switch between radio stations
- 🎙️ **Recording** — Record and save audio from streams
- 📊 **Analytics Dashboard** — View listener statistics and analytics
- 👥 **Listeners Management** — Monitor active listeners
- 📚 **Library** — Access your saved recordings and favorites
- 🌙 **Dark/Light Theme** — Toggle between dark and light modes
- 🎨 **Glassmorphism UI** — Beautiful glass-effect design with animated backgrounds

## 🛠️ Tech Stack

- **React Native** with Expo SDK 56
- **TypeScript** for type-safe development
- **React Native Web** for web platform support
- **Expo AV** for audio playback and recording
- **Cloudflare Workers** for deployment

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/UmarAziz01/RadioApp.git
cd RadioApp

# Install dependencies
npm install

# Start the development server
npm start
```

### Running on platforms

```bash
# Web
npm run web

# Android
npm run android

# iOS
npm run ios
```

## 📁 Project Structure

```
radio-app/
├── App.tsx                 # Main application entry
├── app.json                # Expo configuration
├── src/
│   ├── components/         # Reusable UI components
│   │   ├── AnimatedBackground.tsx
│   │   ├── GlassButton.tsx
│   │   ├── GlassCard.tsx
│   │   ├── Icons.tsx
│   │   ├── NavMenu.tsx
│   │   ├── ThemeToggle.tsx
│   │   └── Toast.tsx
│   ├── screens/            # Application screens
│   │   ├── RadioScreen.tsx
│   │   ├── LiveScreen.tsx
│   │   ├── StationsScreen.tsx
│   │   ├── RecordingsScreen.tsx
│   │   ├── LibraryScreen.tsx
│   │   ├── AnalyticsScreen.tsx
│   │   ├── ListenersScreen.tsx
│   │   ├── SettingsScreen.tsx
│   │   └── ...
│   ├── context/            # React Context providers
│   ├── theme/              # Theme configuration
│   └── utils/              # Utility functions
├── assets/                 # Static assets
└── web/                    # Web entry point
```

## 🌐 Deployment

This app is deployed on **Cloudflare Workers**. See the deployment workflow in `.github/workflows/deploy.yml`.

## 📄 License

This project is licensed under the MIT License.

## 👤 Author

**Umar Aziz** — [@UmarAziz01](https://github.com/UmarAziz01)