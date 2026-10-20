# Welcome to your Expo app 👋

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.

## Backend API Configuration

The mobile app connects to the PHP backend via `services/api/config.js` using the environment variable `EXPO_PUBLIC_API_URL` defined in `.env`.

To configure your API endpoint in `.env`:

### 1. Physical Device (Testing via Expo Go on phone)
Make sure your phone and development PC are connected to the same Wi-Fi network. Find your PC's IPv4 address:
```bash
ipconfig
```
Look for `Wireless LAN adapter WiFi` -> `IPv4 Address` (e.g., `10.98.80.69`). Set `.env` to:
```env
EXPO_PUBLIC_API_URL=http://<YOUR_PC_IP>/resource-allocation-api/apis.php
```
Example:
```env
EXPO_PUBLIC_API_URL=http://10.98.80.69/resource-allocation-api/apis.php
```

### 2. Android Emulator
Android emulators run on a virtual network where `10.0.2.2` aliases your development machine's `127.0.0.1` (localhost):
```env
EXPO_PUBLIC_API_URL=http://10.0.2.2/resource-allocation-api/apis.php
```

### 3. iOS Simulator
The iOS simulator shares your machine's localhost network:
```env
EXPO_PUBLIC_API_URL=http://localhost/resource-allocation-api/apis.php
```

> **Note:** After modifying `.env`, restart the Expo development server with cache cleared:
> ```bash
> npx expo start -c
> ```

