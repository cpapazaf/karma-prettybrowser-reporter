var os = require('os');
var path = require('path');
var fs = require('fs');
var util = require('util');
var builder = require('xmlbuilder');

var BrowserReporter = function(baseReporterDecorator, config, emitter, logger, helper, formatError) {
  var log = logger.create('prettyBrowserReporter');

  var outputFile = config.outputFile;
  var title = config.title || 'Browser Test Results';
  var showPassed = config.showPassed || false;
  var showFailedFirst = config.showFailedFirst || false;

  var cssFile = 'karma-prettybrowser-reporter.css';
  var jsFile = 'karma-prettybrowser-reporter.js';
 
  var html;
  var body;
  var suites;
  var pendingFileWritings = 0;
  var fileWritingFinished = function() {};
  var allMessages = [];
  
  baseReporterDecorator(this);
  
  // TODO: remove if public version of this method is available
  var basePathResolve = function(relativePath) {

    if (helper.isUrlAbsolute(relativePath)) {
      return relativePath;
    }

    if (!helper.isDefined(config.basePath) || !helper.isDefined(relativePath)) {
      return '';
    }

    return path.resolve(config.basePath, relativePath);
  };

  var htmlHelpers = {
    initialize: function() {
      var head = html.ele('head');
      head.ele('meta', {charset: 'utf-8'});
      head.ele('title', {}, title);
      head.ele('link', {rel: 'stylesheet', type: 'text/css', href: cssFile}, '');
      head.ele('script', {type:'text/javascript', src: 'http://code.jquery.com/jquery-1.4.2.js'}, '//empty');
      head.ele('script', {type:'text/javascript', src: jsFile}, '//empty');
      body = html.ele('body');
      body.ele('h1', {}, title);
    }
  };

  var printSuites = function() {
    //browserPies = body.ele('div', {id: 'browserPies'});
    //generalLeft = browserPies.ele('div', {id: 'browserPiesLeft'}, '');
    //generalRight = browserPies.ele('div', {id: 'browserPiesRight'}, '');

    browsersSide = body.ele('div', {id: 'browsersTable'});
    
    browserTable = browsersSide.ele('table', {cellspacing:'0', cellpadding:'0', border:'0', class:'browsers'});

    var browser_table_title = browserTable.ele('tr', {class:'header'});
    ['Browser Name', 'Total', 'Pass', 'Fail', 'Skip', 'Time'].forEach(function(item) { 
      browser_table_title.ele('td', {align:'center'}, item); 
    });

    for (var browserId in suites) {
      var browserInfo = suites[browserId];
      var browserFail = browserInfo.failed > 0 ? 'fail' : browserInfo.skipped > 0 ? 'skip': browserInfo.disconnected || browserInfo.error? 'error' : 'pass';
      var browser_row = browserTable.ele('tr', {class:browserFail, id:browserId});
      browser_row.ele('td', {}, browserInfo.browserName);
      
      [browserInfo.total, browserInfo.total - browserInfo.failed - browserInfo.skipped, 
      browserInfo.failed, browserInfo.skipped, browserInfo.runtime].forEach(function(item) { 
        browser_row.ele('td', {align:'center'}, item); 
      });

      // If there is some error do not show any specs
      if(browserInfo.disconnected || browserInfo.error){
        return;
      }

      var browser_row_specs = browserTable.ele('tr', {});
      var specs_table_row = browser_row_specs.ele('td', {colspan:"6", class:'spec'});

      var space_table = specs_table_row.ele('table',{cellspacing:'0', cellpadding:'0', border:'0', class:'specs', id:browserId});
      
      var specs = browserInfo.specs;
      if(showFailedFirst) {
        specs = failedFirstSpecs(browserInfo.specs);
      } 

      for (var spec in specs) {
        //var spec = JSON.stringify(spec);
        var specStatus = specs[spec].skipped ? 'skip' : (specs[spec].success ? 'pass' : 'fail');
        if(!showPassed && specs[spec].success) {
          continue;
        }

        var space_table_row = space_table.ele('tr', {class:specStatus});
        var col = space_table_row.ele('td', {}, specs[spec].description);
        if (!specs[spec].success) {
          specs[spec].errorLog.forEach(function(err) {
            col.raw('<br />' + formatError(err).replace(/</g,'&lt;').replace(/>/g,'&gt;'));
          });
        }
      }
    }
  };

  var failedFirstSpecs = function(specs) {
    var red = [];
    var yellow = [];
    var green = [];
    for (var spec in specs) {
      if(specs[spec].skipped) {
        yellow.push(specs[spec]);
      } else if (specs[spec].success) {
        green.push(specs[spec]);
      } else {
        red.push(specs[spec]);
      }
    }

    return red.concat(yellow).concat(green);
  }

  this.adapters = [function(msg) {
    allMessages.push(msg);
  }];

  this.onRunStart = function(browsers) {
    suites = Object.create(null);

    html = builder.create('html', null, 'html', { headless: true });
    html.doctype();

    htmlHelpers.initialize();
  };
  
  this.onBrowserStart = function (browser) {
    log.debug('onBrowserStart');
    suites[browser.id] = {
      'browserFullName': browser.fullName,
      'browserName': browser.name,
      'specs': []
    };
  };

  this.onBrowserComplete = function(browser) {
    log.debug('onBrowserComplete');
    suites[browser.id] = util._extend(suites[browser.id], {
      'total' : browser.lastResult.total,
      'disconnected': browser.lastResult.disconnected,
      'error': browser.lastResult.error,
      'failed': browser.lastResult.failed,
      'skipped': browser.lastResult.skipped,
      'runtime': ((browser.lastResult.netTime || 0) / 1000) + 's'
    });
  };

  this.onRunComplete = function() {
    log.debug('onRunComplete');
    log.debug(suites);
    printSuites();
    
    var htmlToOutput = html;

    pendingFileWritings++;

    config.basePath = path.resolve(config.basePath || '.');
    outputFile = basePathResolve(outputFile);
    helper.normalizeWinPath(outputFile);
    var dirname = path.dirname(outputFile);
  
    helper.mkdirIfNotExists(dirname, function() {

      //write the js and css files
      fs.createReadStream(path.join(__dirname, cssFile)).pipe(fs.createWriteStream(path.join(dirname, cssFile)));
      fs.createReadStream(path.join(__dirname, jsFile)).pipe(fs.createWriteStream(path.join(dirname, jsFile)));

      fs.writeFile(outputFile, htmlToOutput.end({pretty: true}), function(err) {
        if (err) {
          log.warn('Cannot write HTML report\n\t' + err.message);
        } else {
          log.debug('HTML results written to "%s".', outputFile);
        }

        if (!--pendingFileWritings) {
          fileWritingFinished();
        }
      });
    });

    suites = html = body = null;
    allMessages.length = 0;
  };

  this.specSuccess = this.specSkipped = this.specFailure = function(browser, result) {
    suites[browser.id].specs.push({
      'description': result.description,
      'skipped': result.skipped,
      'success': result.success,
      'time': ((result.time || 0) / 1000) + 's',
      'errorLog': result.success?'':result.log
    });
  };

  // TODO(vojta): move to onExit
  // wait for writing all the html files, before exiting
  emitter.on('exit', function(done) {
    if (pendingFileWritings) {
      fileWritingFinished = done;
    } else {
      done();
    }
  });
};

BrowserReporter.$inject = ['baseReporterDecorator', 'config.browserReporter', 'emitter', 'logger', 'helper', 'formatError'];

// PUBLISH DI MODULE
module.exports = {
  'reporter:prettyBrowserReport': ['type', BrowserReporter]
};
