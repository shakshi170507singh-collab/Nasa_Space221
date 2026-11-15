# TODO

## Connect the existing 3D Moon module to the main website — complete

- [x] The main client renders the existing Moon chapter between the Explore and Quiz sections.
- [x] The Moon chapter remains lazy-loaded and shows a readable fallback while its 3D code is loading or fails.
- [x] The Apollo 11 3D model, terrain model, Draco decoder, Moon images, and bootprint image resolve from the main client's public asset paths.
- [x] The main client includes the Moon module's required runtime dependencies and produces a successful production build.

## Repair the client build setup — complete

- [x] The client package installs the dependencies required by React, Vite, React Three Fiber, Drei, and Three.js.
- [x] The client production build completes without missing-module errors.
- [x] The route manifest declares the current root page.
