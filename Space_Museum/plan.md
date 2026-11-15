# Space Museum Moon Module Integration Plan

## Scope

Connect the existing Apollo 11 3D Moon experience to the main React/Vite client, repair the client dependency setup, and keep the 3D code lazy-loaded so the landing experience remains fast.

## Implementation

- Move the existing MoonExplorer component, supporting components, styles, and artifact data into the main client source tree.
- Add the Moon module's React Three Fiber, Drei, and Three.js dependencies to `client/package.json` and regenerate the client lockfile with npm.
- Copy the Moon module's Draco decoder, NASA model files, and images into `client/public` so the existing root-relative asset URLs work in the integrated app.
- Keep the current `App.jsx` lazy import and fallback boundary, then verify that the main layout renders Hero, Explore, Moon, Quiz, and Footer in that order.
- Add a static route manifest and museum page title required by the web runtime guidance.

## Design

The existing design is retained: cinematic dark space-museum styling, lime interaction highlights, editorial artifact labels, and a guide-led narrative. The Moon chapter remains a focused interactive exhibit rather than replacing the existing home page.

## Project structure

- `client/src/App.jsx`: page composition and lazy Moon integration.
- `client/src/components/MoonExplorer.jsx`: 3D scene and story interaction.
- `client/src/components/MoonGlobe.jsx`, `PatchRobot.jsx`, `SafeSection.jsx`: Moon support components.
- `client/src/data/moonArtifact.js`: NASA-backed artifact content and credits.
- `client/public/models`, `client/public/images`, `client/public/draco`: runtime assets.
- `client/manus-routes.json`: declared page routes.
