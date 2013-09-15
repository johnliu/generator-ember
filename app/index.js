'use strict';
var util = require('util');
var path = require('path');
var yeoman = require('yeoman-generator');

var EmberGenerator = module.exports = function EmberGenerator(args, options) {
  yeoman.generators.Base.apply(this, arguments);

  if (this.appname.match(/^[Ee]mber$/)) {
    this.appname += '_app';
  }

  // setup the test-framework property, Gruntfile template will need this
  this.testFramework = options['test-framework'] || 'mocha';

  // for hooks to resolve on mocha by default
  if (!options['test-framework']) {
    options['test-framework'] = 'mocha';
  }

  // hook for karma test runner
  this.options.karma = options.karma;

  // resolved to mocha by default (could be switched to jasmine for instance)
  this.hookFor('test-framework', { as: 'app' });

  this.indexFile = this.readFileAsString(path.join(this.sourceRoot(), 'index.html'));
  this.pkg = JSON.parse(this.readFileAsString(path.join(__dirname, '../package.json')));

  // this holds the list of scripts we want to include in components.js
  this.bowerScripts = [
    'bower_components/jquery/jquery.js',
    'bower_components/handlebars/handlebars.runtime.js',
    'bower_components/ember/ember.js',
  ];

  this.on('end', function() {
    this.installDependencies({ skipInstall: options['skip-install'] });
  });
};

util.inherits(EmberGenerator, yeoman.generators.Base);

EmberGenerator.prototype._getJSPath = function _getJSPath(file) {
  return file + '.js';
};

EmberGenerator.prototype.welcome = function welcome() {
  // welcome message
  console.log(this.yeoman);
};

EmberGenerator.prototype.askFor = function askFor() {
  var cb = this.async();

  var prompts = [];
  this.prompt(prompts, function (props) {
    cb();
  }.bind(this));
};

EmberGenerator.prototype.createDirLayout = function createDirLayout() {
  this.mkdir('app/templates');
  this.mkdir('app/styles');
  this.mkdir('app/images');
  this.mkdir('app/scripts');
  this.mkdir('app/scripts/models');
  this.mkdir('app/scripts/controllers');
  this.mkdir('app/scripts/routes');
  this.mkdir('app/scripts/views');
  this.mkdir('app/scripts/components');
  this.mkdir('app/scripts/helpers');
};

EmberGenerator.prototype.git = function git() {
  this.copy('gitignore', '.gitignore');
  this.copy('gitattributes', '.gitattributes');
};

EmberGenerator.prototype.bower = function bower() {
  this.copy('bowerrc', '.bowerrc');
  this.copy('_bower.json', 'bower.json');
};

EmberGenerator.prototype.packageFile = function packageFile() {
  this.copy('_package.json', 'package.json');
};

EmberGenerator.prototype.jshint = function jshint() {
  this.copy('_jshintrc', '.jshintrc');
};

EmberGenerator.prototype.tests = function tests() {
  if (this.options.karma) {
    this.mkdir('test');
    this.mkdir('test/support');
    this.mkdir('test/integration');
    this.copy('karma.conf.js', 'karma.conf.js');

    this.template(this._getJSPath('test/_initializer'), this._getJSPath('test/support/initializer'));
    this.template(this._getJSPath('test/integration/_index'), this._getJSPath('test/integration/index'));
  }
};

EmberGenerator.prototype.editorConfig = function editorConfig() {
  this.copy('editorconfig', '.editorconfig');
};

EmberGenerator.prototype.gruntfile = function gruntfile() {
  this.template('Gruntfile.js');
};

EmberGenerator.prototype.templates = function templates() {
  this.copy('hbs/application.hbs', 'app/templates/application.hbs');
  this.copy('hbs/index.hbs', 'app/templates/index.hbs');
};

EmberGenerator.prototype.writeIndex = function writeIndex() {
  var mainCssFiles = [];
  mainCssFiles.push('styles/normalize.css');
  mainCssFiles.push('styles/lib.css');
  mainCssFiles.push('styles/core.css');

  this.indexFile = this.appendFiles(this.indexFile, 'css', 'styles/main.css', mainCssFiles, null, '.tmp');

  this.indexFile = this.appendScripts(this.indexFile, 'scripts/components.js', this.bowerScripts);

  this.indexFile = this.appendFiles(this.indexFile, 'js', 'scripts/templates.js', ['scripts/compiled-templates.js'], null, '.tmp');
  this.indexFile = this.appendFiles(this.indexFile, 'js', 'scripts/main.js', ['scripts/combined-scripts.js'], null, '.tmp');
};

EmberGenerator.prototype.all = function all() {
  this.write('app/index.html', this.indexFile);

  this.copy('styles/normalize.styl', 'app/styles/normalize.styl');
  this.copy('styles/lib.styl', 'app/styles/lib.styl');
  this.copy('styles/core.styl', 'app/styles/core.styl');

  this.copy(this._getJSPath('scripts/app'), this._getJSPath('app/scripts/app'));
  this.copy(this._getJSPath('scripts/router'), this._getJSPath('app/scripts/router'));
  this.copy(this._getJSPath('scripts/routes/application_route'), this._getJSPath('app/scripts/routes/application_route'));
};
