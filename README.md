# jump-start

A shortcut to my favorite code. Want your own? Check out
[kevinschaul/jump-start-template](https://github.com/kevinschaul/jump-start-template).

## Starters

---

### react-d3

#### LineChart

    npx degit kevinschaul//react-d3/LineChart \
  components/elements/LineChart

A React component for writing a responsive D3 line chart.

Tags: `react`, `d3`, `chart`

#### Chart

    npx degit kevinschaul//react-d3/Chart \
  components/elements/Chart

An empty React component for writing a responsive D3 chart.

* Adds size prop
* Sets up margin convention

Tags: `react`, `d3`, `chart`

---

### r

#### data-analysis

    npx degit kevinschaul//r/data-analysis analysis

A Quarto/R template for data journalism projects

---

### geo

#### pmtiles-counties

    npx degit kevinschaul//geo/pmtiles-counties geo

A demo Makefile for creating map tiles at the county level


## Adding a starter

Why not use jump-start to add a starter? Run the following command, replacing
STARTER_GROUP with a group name (e.g. `react`), and STARTER_NAME with a
starter name (e.g. `BarChart`).

    npx degit kevinschaul/jump-start-template/example/starter STARTER_GROUP/STARTER_NAME

Then, add your code, and edit the generated `jump-start.yaml` file to your liking.

### `jump-start.yaml`

Each starter must contain this file, which defines a few items used by the
gallery.

Some examples:

- [kevinschaul react-d3/LineChart](https://github.com/kevinschaul/jump-start/blob/main/react-d3/LineChart/jump-start.yaml)
- [kevinschaul r/data-analysis](https://github.com/kevinschaul/jump-start/blob/main/r/data-analysis/jump-start.yaml)

**`description`**: Anything you want to write about this starter. It could be
the code’s features, any additional installation instructions, whatever. This
appears in the `## Starters` section of the README.md, and in the web gallery.

**`defaultDir`**: Where the files generated by this starter will be placed by
default. For example, if you know that your React components live in
`components/elements/`, set the `defaultDir` to that. The jump-start command
shown in the README.md and gallery will place the files into this directory.

**`mainFile`** (optional): The file shown initially in the gallery's "Starter files
section.

**`preview`** (optional): Configuration that gets passed down to the gallery's
"Preview" section. The previews render via
[Sandpack](https://sandpack.codesandbox.io/docs/getting-started/usage), so this
configuration mimics Sandpack's. Currently only supports React. Your starter
must include the file `Preview.js`, which default exports a React component.

**`preview.template`** (optional, e.g. "react"): The template used by Sandpack.
I've only used "react" but others may work too.

**`preview.dependencies`** (optional, e.g. `d3: "5"`): An object containing
dependencies for Sandpack to use for the preview. Think of it as the
`package.json` file for the preview. Anything your starter needs should be
listed here.

  
## Running the gallery locally

The jump-start gallery code lives in [a separate
repo](https://github.com/kevinschaul/jump-start-gallery),
included in this repo as a git submodule. To run the gallery
locally, using the starters in this repo as its data:

    npm run gallery:clone
    npm run gallery:install
    npm run gallery:link
    npm run gallery:dev

Open [localhost:3000](localhost:3000) in a browser.

## Updating the gallery code

The snapshot of the jump-start-gallery code in this repo will
inevitibly get outdated. To update it to the latest version:

    npm run gallery:update
 
