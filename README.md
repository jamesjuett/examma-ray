# examma-ray

Examma Ray is a system for generating randomized or individualized exams which can be taken in a web browser.

Each exam is generated as a static HTML file that includes a common javascript bundle. You distribute those files to students however you want. A simple web server that serves static content works great, and there are several options for hosting if you don't want to set something up on your own. You could even distribute the files directly to students, e.g. in a zip file containing the javascript bundle as well.

Students open the `.html` file and take the exam in their web browser. The application is entirely client-side, and does not depend on a server (other than perhaps to originally serve the `.html` and `.js` bundle, if you choose to go that route.). As student's work, their answers are automatically backed up to their browser's local storage (as long as they're not using private/incognito mode). When students are finished, they click a button to download a `.json` "answers file", which they should submit separately (e.g. via Canvas).

## Usage and Documentation

Documentation is available at  
[https://jamesjuett.github.io/examma-ray/](https://jamesjuett.github.io/examma-ray/)

## Contributing

See the [Contributing Guide](CONTRIBUTING.md).
