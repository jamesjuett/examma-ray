
Install dependencies using `npm`:

```console
npm install
```

Due to a [bug](https://github.com/highlightjs/highlight.js/issues/2682) in `highlight.js`, you'll also need to run the following:

```console
cp node_modules/highlight.js/types/index.d.ts node_modules/highlight.js/lib/core.d.ts
```


### Publishing to `npm`

Update version number in `package.json`.

```console
tsc
npm publish
```