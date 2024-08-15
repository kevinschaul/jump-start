# jump-start

A shortcut to my favorite code. Want your own? Check out
[kevinschaul/jump-start-template](https://github.com/kevinschaul/jump-start-template).

`jump-start` is a lightweight system to organize that code that
you keep coming back to. It’s a structured GitHub repository
and a web frontend.

A **starter** is a directory of code that you like -- whether
it’s a single script or an entire app. Each starter lives in a
**group** directory. Organize similar code for easier
navigation.

When you want to use your favorite code, locate that starter
either in this README.md or in your gallery website. Copy the
command, and run it in your terminal. Your starter code is now
in your project.

## Starters


<!-- NOTE: The starters section of this readme is auto-generated by .github/workflows/deploy.yml -->

Jump to group:
- [react-d3](#react-d3)
- [react](#react)
- [r](#r)
- [python](#python)
- [node](#node)
- [github-actions](#github-actions)
- [geo](#geo)

---

### react-d3

react-d3/**LineChart**

```
npx tiged kevinschaul/jump-start/react-d3/LineChart \
  components/elements/LineChart
```

A React component for writing a responsive D3 line chart.

---
react-d3/**Chart**

```
npx tiged kevinschaul/jump-start/react-d3/Chart \
  components/elements/Chart
```

An empty React component for writing a responsive D3 chart.

* Adds size prop
* Sets up margin convention

---
### react

react/**useViewportHeightUnits**

```
npx tiged kevinschaul/jump-start/react/useViewportHeightUnits \
  react/useViewportHeightUnits
```

Makes the newer CSS height units available in JS, like `lvh` and `svh`
https://css-tricks.com/the-large-small-and-dynamic-viewports/

Implementation based on
https://github.com/joppuyo/large-small-dynamic-viewport-units-polyfill

---
react/**useMediaQuery**

```
npx tiged kevinschaul/jump-start/react/useMediaQuery \
  react/useMediaQuery
```

Makes CSS media queries available in JS. Use like:

```
const isSkinny = useMediaQuery('(max-width: 600px)')
```

---
### r

r/**data-analysis**

```
npx tiged kevinschaul/jump-start/r/data-analysis analysis
```

A Quarto/R template for data journalism projects

---
### python

python/**script**

```
npx tiged kevinschaul/jump-start/python/script python/script
```

A python script with argparse

---
### node

node/**cli**

```
npx tiged kevinschaul/jump-start/node/cli node/cli
```

A node/ts CLI with argument parser, subcommands and tests.

Develop the command with:

```
npm install
npm run dev
```

Test with:

```
npm test
```

---
### github-actions

github-actions/**node-release-please**

```
npx tiged kevinschaul/jump-start/github-actions/node-release-please \
  .github/workflows
```

GitHub action for automating release PRs and npm releases with [release-please](https://github.com/googleapis/release-please-action)

---
### geo

geo/**pmtiles-counties**

```
npx tiged kevinschaul/jump-start/geo/pmtiles-counties geo
```

A demo Makefile for creating map tiles at the county level

---

## Adding a starter

Why not use jump-start to add a starter? Run the following command, replacing
STARTER_GROUP with a group name (e.g. `react`), and STARTER_NAME with a
starter name (e.g. `BarChart`).

```
npx degit kevinschaul/jump-start-template/example/starter STARTER_GROUP/STARTER_NAME
```

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

### `degit.json`

`jump-start` uses the [`tiged`](https://github.com/tiged/tiged) command to pull
starter files out of GitHub. That command has a feature that allows for some
actions to be run upon cloning -- most notably allowing a starter to remove
files. Those actions are defined in a file called `degit.json`.

Why `degit`, you reasonably ask? Well
[`degit`](https://github.com/Rich-Harris/degit) was the original tool, but it
has been abandoned. `tiged` is the updated fork. `tiged` is `degit` spelled
backwards.

It is likely you'll want all of your starters to include the following
`degit.json` file, which automatically removes `jump-start.yaml` after your
started is used:

```
[
	{
		"action": "remove",
		"files": ["jump-start.yaml"]
	}
]
```

## Customizing gallery-wide settings with `.env`

`jump-start` uses `.env` for a few settings:

- `GITHUB_USERNAME`: GitHub usename used in commands and links. This is set by
  default in the deploy GitHub action.
- `GITHUB_REPO`: GitHub repo name used in commands and links. This is set by
  default in the deploy GitHub action.
- `DEGIT_MODE`: Sets [`tiged`'s `--mode`
  option](https://github.com/tiged/tiged?tab=readme-ov-file#private-repositories).
  Can be "tar" (the default) or "git".

## Running the gallery locally

The jump-start gallery code lives in [a separate
repo](https://github.com/kevinschaul/jump-start-gallery),
included here as an npm package. To run the gallery
locally, using the starters in this repo as its data:

```
npm install
npm run dev
```

Open [localhost:6006](localhost:6006) in a browser.

## Deploying the gallery to Github Pages

This repo includes a [deploy workflow](.github/workflows/deploy.yml) that
deploys your jump start gallery to Github pages.
