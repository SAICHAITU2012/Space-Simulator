# SpaceVerse

SpaceVerse is a phone-first astronomy learning prototype built with React Native, Expo, Three.js, and `@react-three/fiber/native`.

## Start Development

1. Install dependencies:

   ```sh
   npm install
   ```

2. Start the Expo development server:

   ```sh
   npm run start:lan
   ```

3. Scan the QR code with Expo Go on the iQOO phone.

4. If LAN scanning fails because the laptop and phone are on different networks, use:

   ```sh
   npm run start:tunnel
   ```

5. If Expo says port `8081` is already in use, start on the fallback port:

   ```sh
   npm run start:lan:8082
   ```

## Verified Local Preview

If the interactive Expo QR server is blocked by the shell environment, you can still verify the app bundle locally:

```sh
npm run export:web
npm run preview:web
```

Then open:

```text
http://127.0.0.1:8090/
```

This is not the final phone demo path, but it verifies the React Native UI, Three.js canvas, local data, and Space Lab logic.

## Demo Flow

1. Open SpaceVerse on the phone.
2. Tap `Enter Universe`.
3. Drag to orbit the Solar System.
4. Pinch or use the zoom controls to move closer.
5. Tap a planet card to focus it.
6. Open `Space Lab` and adjust mass, radius, velocity, and gravity.
7. Turn on `Motion` mode to let device tilt gently influence the camera when sensors are available.

## Architecture Notes

- Expo provides the mobile development loop, QR launch, fast refresh, and native module packaging.
- `expo-gl` provides the native OpenGL/WebGL render target.
- `@react-three/fiber/native` is the main 3D React renderer over Three.js.
- Core planet data and physics equations are bundled locally.
- The AI Space Buddy is a placeholder layer by design; the simulation works offline first.
