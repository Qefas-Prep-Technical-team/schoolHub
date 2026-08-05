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

## Deploying to EAS (Expo Application Services)

To build and deploy your app to Android or iOS using EAS, follow these steps:

1. **Install EAS CLI** (if you haven't already):

   ```bash
   npm install -g eas-cli
   ```

2. **Log in to your Expo account**:

   ```bash
   eas login
   ```

3. **Configure your project for EAS** (first time only):

   ```bash
   eas build:configure
   ```

4. **Create a Build**:
   - For an Android APK (Preview):
     ```bash
     eas build -p android --profile preview
     ```
   - For an Android App Bundle (AAB for Google Play):
     ```bash
     eas build -p android --profile production
     ```
   - For iOS:
     ```bash
     eas build -p ios
     ```

## Troubleshooting: Rebuilding Native Directories

If you ever run into deep native cache issues or need to regenerate the `android` or `ios` folders after changing `app.json` or installing native modules, you can delete and recreate them.

**To delete the android folder:**
(Run this in your PowerShell terminal from the `Mobile` directory)

```powershell
Remove-Item -Recurse -Force android
```

**To regenerate the native folders:**

```bash
npx expo prebuild
```

**running the app on emulator for full test**

```bash
npx expo run:android
```
