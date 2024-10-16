![Made for Quick Webfont conversion to OTF on Mac](/public/fontless_cover.avif "Made from Pain")

> [!NOTE]
>
> # Fontless
>
> ```
> Development completed. Requirements satisfied on MacOS Sequoia Version 15.0.1.
> ```
>
> <sup>This repo is not maintained through any release cycle. This is a personal project to fill a painpoint I have as a developer dealing day-in-day-out with webfonts. I'm also a Designer and often need an OTF or TTF that can work within Figma(@Figma). Figma does not allow non-organization accounts take advantage of such a necessary and expected basic functionality even for paying customers. That painpoint cascades more pain, stories for another day. I created this to QUICKLY take the webfonts I'm working with inside any given project and convert them over to TTF/OTF to save time, and mind.</sup>
>
> <sub>Bryan Funk</sub>

> [!IMPORTANT]
>
> ### :mortar_board: Goals and status
>
> ## Convert webfonts to TTF/OTF quickly for Figma work
>
> - [x] MVP
>
> - <sup>Satisfy the requirements and needs of quickly being able to convert webfonts into TTF/OTF fonts compatible with Figma but also satisfy whatever Apple has implemented into MacOS Sequoia that has severely limited font compatability TTF/OTF fonts.</sup>
>
> - [ ] Consider a larger release at a later date
>
>

> [!TIP]
>
> ### Build & Develop
>
> The whole process of conversion happens only on browsers. Once the app is loaded, no server interaction occurs.
> 
> This app uses WebAssembly and Web Workers. You need a modern browser to run this app. Major browsers like > Firefox, Google Chrome, Safari and Edge support them.
> 
> You need [emscripten](https://emscripten.org/docs/getting_started) to build.
>
> To develop all apps and packages, run the following command:
>
> ```sh
> $ git clone --recursive https://github.com/prodkt/fontless
>
> # Install dependencies
> $ yarn
>
> # Build wasm for woff2 support
> $ yarn make-wasm
>
> # Testing
> $ yarn test
>
> # Build web app
> $ yarn build
>
> # Build production web app
> $ yarn build:production
>
> # optional: Launch http server for local development
> $ yarn start
> ```
>
> ```sh
> WASM runtime initialized
> Module created successfully
> Converter constructor called
> Converter constructor completed
>     ✓ otf to woff
>     ✓ otf to woff2
>     ✓ woff to woff2
>     ✓ woff2 to otf
> ```
