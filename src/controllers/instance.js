const Path = require('path');
const chokidar = require('chokidar');
const colors = require('colors');

const File = require('./file');
const Task = require('./task');
const Logger = require('./logger');
const {parseCliArgsAsVariables} = require('../utils');

class Instance {
	constructor({commander, tools}){
		Object.assign(this, {
			_commander: commander,
			_tools: tools,
			_logger: this.buildLogger('Watcher'),

			_tasks: {},
			_ignoreChangesInFiles: new Set()
		});
	}

	get logger() {
		return this._logger;
	}
	get tools() {
		return this._tools;
	}

	useTask(name, config = {}) {
		const task = Task.build(this, {name, ...config});

		if (config.watch) this._setupWatcher(task, config.watch);
		if (config.runFromCli) this._setupCli(task, config.cliVars);

		return this._tasks[name] = task;
	}
	buildLogger(title) {
		return Logger.build({title});
	}

	ignoreFileWatching(path) {
		return this._ignoreChangesInFiles.add(path);
	}
	unignoreFileWatching(path) {
		return this._ignoreChangesInFiles.delete(path);
	}

	_setupCli(task, cliVars = '') {
		const {description, name} = task;
		const params = cliVars
			.trim()
			.split(' ')
			.filter(value => !!value.trim());

		this._commander.registerCommand(name, {params, description}, onTaskCliAction);

		function onTaskCliAction(...args) {
			const variables = parseCliArgsAsVariables(params, ...args);
			task.run(variables);
		}
	}
	_setupWatcher(task, watchConfig) {
		const {minmatch, ignore, ignoreByFilename, ignoreByPath} = watchConfig;
		const watcher = chokidar.watch(minmatch, {ignored: ignore});

		watcher.on('change', path => {
			const pathSegments = File.parsePathSegments(path);
			const {name, ext, full} = pathSegments;

			if (this._ignoreChangesInFiles.has(path)) return false;
			if (ignoreByFilename && ignoreByFilename.test(`${name}${ext}`)) return false;
			if (ignoreByPath && ignoreByPath.test(path)) return false;

			this.logger.info(`${colors.magenta.bold(path)} - has been changed`);
			
			task.setInputFilePath(full);
			task.run();
		});
	}

	static build(utils = {}) {
		return new Instance(utils)
	}
}

module.exports = Instance;