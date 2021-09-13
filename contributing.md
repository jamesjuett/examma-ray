
Install dependencies using `npm`:

```console
npm install
```

Due to a [bug](https://github.com/highlightjs/highlight.js/issues/2682) in `highlight.js`, you'll also need to run the following:

```console
cp node_modules/highlight.js/types/index.d.ts node_modules/highlight.js/lib/core.d.ts
```


### Running Unit Tests

Run unit tests
```console
npm run test
```

### Run Cypress Tests

Generate test exams and serve them:

```console
npm run gen-test-exams
npm run serve-test-exams
```

In a separate terminal, run cypress tests:
```console
npm run cypress:run
```

Or open cypress UI to run/inspect tests:
```console
npm run cypress:open
```

(Note that this launches a GUI. If you're on WSL you might need to look into getting an X server set up.)


### Publishing to `npm`

Update version number in `package.json`.

```console
tsc
npm publish
```