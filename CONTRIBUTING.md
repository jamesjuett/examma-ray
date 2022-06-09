# Contributing Guide

Guide for contributing to `examma-ray`.

## Getting Started

Ensure you have `node` and `npm` installed:

On Linux or WSL:

```bash
$ sudo apt update
$ sudo apt install nodejs
```

Or if you're on a Mac, you can use homebrew:

```console
brew install nodejs
```

Make sure you have Node 11 or greater:

```console
node --version
```

Create a local development clone of this repository. From the base directory of the repo, install dependencies using `npm`:

```console
npm install
```

Then, create a global symlink so that you can use your development version of `examma-ray` as a package in other projects.

```console
npm link
```

To compile everything (initially and any time you make contributions), run:

```console
npm run prepublish
```

You'll want some sample exams to test things out. Clone the sample exam repository at [https://github.com/jamesjuett/examma-ray-sample](https://github.com/jamesjuett/examma-ray-sample).

From the base directory of that repository, install dependencies and then link your development version of `examma-ray`.

```console
npm install
npm link examma-ray
```

Now the sample exams will use your local development version of `examma-ray`.


## Editor

Make sure you've got an editor with decent typescript support. I use VS Code.

