# LabNotebook
An experimental approach to keeping a modern scientific / engineering lab notebook.

## Build Dependencies
- [SCons](https://scons.org/)
- gcc or Visual Studio <= 2015
- [Dokan](https://github.com/dokan-dev/dokany/releases) or [libfuse](https://github.com/libfuse/libfuse)

Be sure you are installing the development components for FUSE or Dokan, not just the driver. On Ubuntu, try `apt-get install libfuse-dev`. The build only checks the default library and header locations.

Known working tools are SCons 3.0.0 on Python 3.6.5, and libfuse version 2.7 or 3.0, or Dokan 1.1.0. The build downloads an appropriate image and VM automatically.

The software relies on various React component libraries, Babel, and other software normally distributed with NPM. A pre-built webpack is committed to the repository under "out/". If you want SCons to build the webpack, Node.js is required.

## Runtime Dependencies
- Windows or 64-bit Linux
- Dokan (Windows) or FUSE (Pre-installed on Ubuntu)

The VM will eventually be bundled with the distributable.

## Build Instructions

1. `git clone https://github.com/kjrandez/LabNotebook.git LabNotebook`
2. `cd LabNotebook`
2. `scons`

SCons will build the development image, the C libraries, and the webpack (if any are missing). All of these will be deleted if you run `scons -c`.

## Deploy & Run

To deploy the NS-to-JavaScript code and run the application, open dev.image with `./dev` or `dev.bat`.

![Deployment Process Screenshot](docs/deploy.png)

1. `[Run]` top-level class **BuildDesktopBackend**
2. `[Deploy]` (as web page) top-level class **BuildDesktopFrontend**
3. Open LabNotebook/out/renderer.html in a browser.

As the application progresses, the build will be modified to produce a distributable package, and the NS-to-JS deployment will be incorporated into the build script.
