# Rich Harbor Platform

Full-stack monorepo for the Rich Harbor platform featuring a unified frontend (mobile + web) and FastAPI backend.

## 📁 Project Structure

```
rh_platform/
├── frontend/              # Tamagui monorepo (Expo + Next.js)
│   ├── apps/
│   │   ├── expo/         # React Native mobile app (iOS + Android)
│   │   └── next/         # Next.js web app (App Router)
│   └── packages/
│       ├── app/          # Shared app logic & navigation (Solito)
│       └── ui/           # Shared UI components (Tamagui)
├── services/
│   └── api/              # FastAPI backend service
├── docker/               # Dockerfiles for services
├── infra/                # Infrastructure as code (Terraform)
└── scripts/              # Utility scripts
```

## 🛠 Tech Stack

### Frontend
- **Framework**: [Tamagui](https://tamagui.dev) - Universal React UI kit
- **Mobile**: Expo SDK 54 + React Native 0.81 + React 19
- **Web**: Next.js 14 (App Router) + React 19
- **Navigation**: [Solito](https://solito.dev) for unified routing
- **Styling**: Tamagui (replaces TailwindCSS/NativeWind)
- **Monorepo**: Yarn 4 workspaces + Turbo

### Backend
- **API**: FastAPI (Python)
- **Database**: PostgreSQL
- **Cache**: Redis
- **Container**: Docker + Docker Compose

### Infrastructure
- **Cloud**: AWS
- **IaC**: Terraform
- **CI/CD**: GitHub Actions (planned)

## 🚀 Quick Start

### Prerequisites
- **Node.js** 22+ and **npm** 10.8+
- **Yarn** 4.5.0 (set automatically via packageManager)
- **Python** 3.11+
- **Docker** + Docker Compose
- **Android Studio** (for Android development)
- **Xcode** (for iOS development, macOS only)

### 1. Backend Setup

Start the FastAPI service with Docker:

```bash
# Start all services (API + PostgreSQL + Redis)
make up

# Check API health
curl http://localhost:8000/v1/health
# Expected: {"status":"ok"}

# Stop services
make down
```

**Available at**: http://localhost:8000

### 2. Frontend Setup

#### Install Dependencies

```bash
cd frontend
yarn install
```

#### Run Web (Next.js)

```bash
# Development mode
yarn web

# Production build
yarn web:prod
yarn web:prod:serve
```

**Available at**: http://localhost:3000

#### Run Mobile (Expo)

```bash
# Start Metro bundler
yarn native

# Or run directly on platforms:
yarn ios       # iOS simulator
yarn android   # Android emulator/device
```

### First-Time Android Setup

If running Android for the first time:

1. **Open Android Studio** and start an emulator
2. **Run prebuild** (one-time):
   ```bash
   cd apps/expo
   npx expo prebuild
   ```
3. **Run the app**:
   ```bash
   yarn android
   ```

The NDK and Android SDK Platform will auto-install on first build.

## 📱 Mobile App Development

### Connecting to Backend

- **iOS Simulator**: Use `http://localhost:8000`
- **Android Emulator**: Use `http://10.0.2.2:8000`
- **Physical Device**: Use your computer's LAN IP (e.g., `http://192.168.0.5:8000`)

Set via environment variable if needed:
```bash
export EXPO_PUBLIC_API_BASE_URL=http://192.168.0.5:8000
```

### Building for Production

#### iOS
```bash
cd apps/expo
eas build --platform ios
```

#### Android
```bash
cd apps/expo
eas build --platform android
```

## 🧪 Testing

### API Tests
```bash
cd services/api
pytest
```

### Frontend Tests
```bash
cd frontend
yarn test
```

## 📦 Adding Dependencies

### Shared JS Dependencies
Install in `packages/app`:
```bash
cd frontend/packages/app
yarn add <package-name>
```

### Native Dependencies
Install in `apps/expo`:
```bash
cd frontend/apps/expo
yarn add <package-name>
```

### Web-Only Dependencies
Install in `apps/next`:
```bash
cd frontend/apps/next
yarn add <package-name>
```

## 🐛 Troubleshooting

### CORS Errors
If the mobile app can't reach the API due to CORS, update `.env`:
```bash
CORS_ORIGINS=http://localhost:19006,http://localhost:8081,http://192.168.0.5:8081
```

### Android Emulator Can't Connect
- Use `http://10.0.2.2:8000` instead of `http://localhost:8000`
- Ensure the API container is running (`make up`)

### Metro Bundler Cache Issues
```bash
cd frontend/apps/expo
npx expo start --clear
```

### NDK Build Errors
If you see NDK errors, the SDK will auto-install. Just re-run the build.

## 📚 Documentation

- **Frontend README**: [frontend/README.md](frontend/README.md)
- **Tamagui Docs**: https://tamagui.dev
- **Expo Docs**: https://docs.expo.dev
- **Next.js Docs**: https://nextjs.org/docs
- **FastAPI Docs**: https://fastapi.tiangolo.com

## 🔐 Environment Variables

### Backend (.env in root)
```bash
DATABASE_URL=postgresql://user:pass@db:5432/dbname
REDIS_URL=redis://redis:6379/0
CORS_ORIGINS=http://localhost:3000,http://localhost:8081
```

### Frontend (frontend/apps/expo/.env)
```bash
EXPO_PUBLIC_API_BASE_URL=http://localhost:8000
```

## 🚢 Deployment

### Vercel (Web App)
- **Root Directory**: `apps/next`
- **Install Command**: `yarn set version stable && yarn install`
- **Build Command**: Default
- **Output Directory**: Default

### EAS (Mobile Apps)
```bash
cd frontend/apps/expo
eas build --platform all
eas submit
```

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Run tests
4. Submit a pull request

## 📄 License

Proprietary - Rich Harbor
