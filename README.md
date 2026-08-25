# Tweakpane
![CI](https://github.com/bpodwinski/tweakpane/workflows/CI/badge.svg)
[![Coverage](https://img.shields.io/endpoint?url=https://gist.githubusercontent.com/bpodwinski/c4ed268357a3d741d67b9d4eb0ac6256/raw/tweakpane-coverage.json)](https://github.com/bpodwinski/tweakpane/actions)
[![npm version](https://badge.fury.io/js/tweakpane-reborn.svg)](https://badge.fury.io/js/tweakpane-reborn)

![cover](https://user-images.githubusercontent.com/602961/146529897-38829c6f-56df-46f6-81fe-d65fb2027eaa.png)

Tweakpane is a compact pane library for fine-tuning parameters and monitoring
value changes, inspired by [dat.GUI][].

- Clean and simple design
- Dependency-free
- Extensible

(dat.GUI user? The [migration guide](https://bpodwinski.github.io/tweakpane/migration/#datgui) can be helpful)


## Installation
Refer to the [Getting Started](https://bpodwinski.github.io/tweakpane/getting-started/) section for concrete steps. Remember to install `tweakpane-reborn-core` if you are developing with TypeScript.


## Features
See the [official page][documents] for details.


### [Bindings](https://bpodwinski.github.io/tweakpane/input-bindings/)
Number, String, Boolean, Color, Point 2D/3D/4D

![Bindings](https://user-images.githubusercontent.com/602961/184479032-38f50be3-e235-4914-85c0-dce316b33ed2.png)


### [Readonly bindings](https://bpodwinski.github.io/tweakpane/monitor-bindings/)
Number, String, Boolean

![Readonly bindings](https://user-images.githubusercontent.com/602961/184479060-44fda993-9f40-4ef1-b363-18e9f9deff7f.png)


### [UI components](https://bpodwinski.github.io/tweakpane/ui-components/)
Folder, Tab, Button, Separator

![UI components](https://user-images.githubusercontent.com/602961/184479079-84ee5436-b5f6-4c35-92eb-94cc8709ff12.png)


### [Theming](https://bpodwinski.github.io/tweakpane/theming/)
![Theming](https://user-images.githubusercontent.com/602961/115102105-e6676500-9f83-11eb-8a74-ae4f76122000.png)


### [Plugins](https://bpodwinski.github.io/tweakpane/plugins/)
![Plugins](https://user-images.githubusercontent.com/602961/184479086-cc8c72c2-c958-4e4e-8ae4-2690f721c544.png)


### [Misc](https://bpodwinski.github.io/tweakpane/misc/)
- Mobile support
- TypeScript type definitions
- JSON import / export


## Development


### CommonJS and ES modules
From version 4, Tweakpane has been migrated to ES modules. If you are looking for a CommonJS version of the package, use version 3.x.


### Build your own Tweakpane

```
$ npm ci
$ npm run setup
$ cd packages/tweakpane
$ npm start
```

The above commands start a web server for the document, build source files, and
watch for changes. Open `http://localhost:8080/` to browse the document.


## Other resources


### [Design Kit](https://www.figma.com/community/file/1324202557355874089)
Includes the basics, styles and components for Tweakpane, providing a practical resource for creating your own plugin.

[![image](https://github.com/cocopon/tweakpane/assets/602961/78cfd81f-d950-48e3-a0f1-6b6a14caaca4)](https://www.figma.com/community/file/1324202557355874089)


## License
MIT License. See `LICENSE.txt` for more information.


[dat.GUI]: https://github.com/dataarts/dat.gui
[documents]: https://bpodwinski.github.io/tweakpane/
