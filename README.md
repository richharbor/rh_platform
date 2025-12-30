# Rich Harbor Platform

Modular full-stack platform for Rich Harbor, featuring a cross-platform mobile app, web admin panel, and Express-based backend.

## 📁 Project Structure

```
rh_platform/
├── front-end/
│   ├── mobile-expo/      # React Native / Expo mobile application
│   └── web-admin/        # Next.js web administration panel
├── rhserver/             # Express.js backend service
├── docker/               # Docker configuration files
├── infra/                # Infrastructure as code (Terraform)
├── scripts/              # Utility scripts for development
└── Makefile              # Development shortcuts
```

## 🛠 Tech Stack

### Frontend
- **Mobile**: Expo SDK 54 + React Native 0.81 + NativeWind v4 (Tailwind CSS)
- **Web**: Next.js 16 + React 19 + Tailwind CSS
- **Styling**: NativeWind (Mobile) / Tailwind CSS (Web)

### Backend
- **API**: Express.js (Node.js)
- **Database**: PostgreSQL with Sequelize ORM
- **Authentication**: JWT (JSON Web Tokens)
- **Push Notifications**: Web-Push & Expo Push Notifications

### Infrastructure
- **Cloud**: AWS
- **Containerization**: Docker + Docker Compose

## 🚀 Quick Start

### Prerequisites
- **Node.js** 22+
- **Docker** + Docker Compose
- **Android Studio** (for Android development)
- **Xcode** (for iOS development, macOS only)

### 1. Environment Setup
Copy the example environment files and fill in the secrets:
```bash
cp .env.example .env
# Also check .env files in subdirectories:
# rhserver/.env
# front-end/mobile-expo/.env
# front-end/web-admin/.env
```

### 2. Backend Setup
Start the database and backend:
```bash
# Using Makefile
make up

# Or directly
npm run dev --prefix rhserver
```

### 3. Mobile Development
```bash
cd front-end/mobile-expo
npm install
npm run android  # or npm run ios / npm run web
```

### 4. Web Admin Development
```bash
cd front-end/web-admin
npm install
npm run dev
```

## 📱 Mobile App Development

### Clean Starts
If you encounter caching issues or "ghost" folders reappearing:
```bash
cd front-end/mobile-expo
npx expo start -c
```

### Android Troubleshooting
Ensure your Android emulator is running before starting:
```bash
npm run android
```

## 🚢 Deployment

The platform is configured for automated deployment via GitHub Actions (Work in progress).

## 🤝 Contributing
1. Create a feature branch
2. Make your changes
3. Submit a pull request

## 📄 License
Proprietary - Rich Harbor

