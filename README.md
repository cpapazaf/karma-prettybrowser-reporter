karma-prettybrowser-reporter
=======================

[![NPM](https://nodei.co/npm/karma-prettybrowser-reporter.png?compact=true)](https://npmjs.org/package/karma-prettybrowser-reporter)



## A karma plugin for exporting unit test results in a pretty HTML format.

This is a plugin for the [Karma Test Runner]. By adding this reporter to your karma configuration, unit test results will be exported as a styled HTML file. For each test browser, a separate table is generated. The plugin is  based on the [karma-junit-reporter plugin] and the [karma-htmlfile-reporter plugin].

## Installation

The easiest way is to keep `karma-prettybrowser-reporter` as a devDependency in your `package.json`.
```json
{
  "devDependencies": {
    "karma": "~0.10",
    "karma-prettybrowser-reporter": "~0.1"
  }
}
```

You can simple do it by:
```bash
npm install karma-prettybrowser-reporter --save-dev
```

## Configuration
```js
// karma.conf.js
module.exports = function(config) {
  config.set({
    reporters: ['progress', 'prettyBrowserReport'],

    browserReporter: {
      outputFile: 'tests/browser-uts.html',
			
      // Optional
      pageTitle: 'Browser Unit Tests',
      showPassed: false, // default: false
      showFailedFirst: true // default: true
    }
  });
};
```

You can pass list of reporters as a CLI argument too:
```bash
karma start --reporters prettyBrowserReport
```

----


[Karma Test Runner]: https://github.com/karma-runner/karma
[karma-junit-reporter plugin]: https://github.com/karma-runner/karma-junit-reporter
[karma-htmlfile-reporter plugin]: https://github.com/matthias-schuetz/karma-htmlfile-reporter
