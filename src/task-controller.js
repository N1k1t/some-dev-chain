const glob = require('glob');
const chokidar = require('chokidar');
const Async = require('some-async-chain');
const colors = require('colors/safe');
const Path = require('path');
const gutil = require('gulp-util');

const tools = require('./tools');

class Task{
	constructor(name, config) {
		let self = this;

		Object.assign(this, {
			_watcher: null,
			config: Object.assign({
				variables: {},
				isChild: false,
				cliVars: ''
			}, config),
			name: name,
			isRunning: false,
			isBreaked: false,
			error: null
		});

		if (config.isChild) return false;
		if (config.watch) this.watch(config.watch);
		if (config.runFromCli) setupTaskCli();

		function setupTaskCli() {
			self.config.commander
				.command(`${name} ${self.config.cliVars.split(' ').map(value => `<${value.substr(1)}>`).join(' ')}`)
				.description(config.description)
				.action((...args) => onTaskCliAction(...args));
		}
		function onTaskCliAction(...input) {
			let args = [...input];
			let taskName = args[0];

			args.pop();
			
			self._useArgsAsVariables(...args);
			self._runChain();
		}
	}

	watch({minmatch, ignore}) {
		this._watcher = chokidar.watch(minmatch, {
			ignored: ignore,
		});

		this._watcher.on('change', (path) => {
			const pathSegments = Path.parse(path);

			if (this.config.instance.ignoreChangesInFiles.indexOf(path) > -1) return false;
			if (this.config.watch.ignoreByFilename && this.config.watch.ignoreByFilename.test(`${pathSegments.name}${pathSegments.ext}`)) return false;
			if (this.config.watch.ignoreByPath && this.config.watch.ignoreByPath.test(path)) return false;

			this.message('[Watcher]', `${colors.magenta.bold(path)} - has been changed`, 'magenta', 'bgMagenta');
			this._runChain(Object.assign(pathSegments, {full: path}));
		});
	}
	break(reason = null) {
		this.isRunning = false;
		this.isBreaked = true;

		if (reason instanceof Error) this.error = reason;
	}
	message(header, message, borderColor, taskColor) {
		let result = '';

		result += `${colors.bold[borderColor || 'green']('|')} ${colors.gray(new Date().toLocaleTimeString())} ${colors[taskColor || 'bgCyan'].white.bold(` ${header} `)}\t${colors.gray('>')}`;
		result += ` ${colors.bold(message)}`;
		
		process.stdout.write(`${result}\n`);
	}

	ignoreFileWatchign(path) {
		this.config.instance.ignoreChangesInFiles.push(path);
	}
	unignoreFileWatchign(path) {
		let index = this.config.instance.ignoreChangesInFiles.indexOf();

		if (index == -1) return false;

		this.config.instance.ignoreChangesInFiles.splice(index, 1);
	}

	writeFile(path, file) {
		this.files.set(path, this._createFile(path, file instanceof Buffer ? file : Buffer.from(file)));
	}
	removeFile(path) {
		this.files.delete(path);
	}
	removeFiles(regexPattern) {
		if (!regexPattern) return this.files.clear();
	}
	mergeChain(chain) {
		this.merge = this.merge.concat(chain);
	}
	_createFile(path, contents) {
		const pathParts = Path.parse(path);

		Object.assign(pathParts, {full: `${pathParts.dir}\\${pathParts.base}`});
		return Object.assign(new gutil.File({cwd: `${__dirname}\\${path}` , base: pathParts.base || '' , path: path , contents: contents}), {
			pathParts: pathParts
		});
	}
	_useArgsAsVariables(...args) {
		let cliVars = this.config.cliVars.split(' ');

		for (let key in args) {
			let value = args[key];

			Object.assign(this.config.variables, {
				[cliVars[key]]: value
			});
		}
	}
	async _runChain(input, cb = Function(null)) {
		let {chain, variables, isChild} = this.config;
		let upTime = new Date().getTime();
		let self = this;

		if (this.isRunning) return false;
		
		Object.assign(this, {
			data: {},
			files: new Map(),
			variables: variables,
			input: input,
			currentSegmentNum: 0,
			isRunning: true,
			isBreaked: false,
			merge: [],
			error: null
		});

		this.message(`<${this.name}>`, colors.gray('Started ...'), 'gray', 'bgBlack');

		for (let key in chain) {
			if (this.isBreaked) continue;

			let segment = chain[key];

			this.currentSegmentNum = key;

			await runSegment(segment);

			for (let mergeSegment of this.merge) {
				if (this.isBreaked) continue;
				await runSegment(mergeSegment);
			}
			this.merge = [];
		}

		this.message(`<${this.name}>`, `${this.error ? 'Failure' : 'Succesfull'} by ${colors.green.bold(`${(new Date().getTime() - upTime) / 1000} s`)}${isChild ? '' : '\n'}`, 'green', 'bgGreen');
		this.break();

		cb(this);

		function runSegment(segment) {
			return Async.createPromise((resolve, reject) => {
				if (!tools[segment.name]) return this.message(`<${this.name}>`, colors.red.bold(`Tool [${segment.name}] is unavalible`), 'red', 'bgRed');

				const segmentRunner = tools[segment.name](self, segment, resolve, reject);

				if (segmentRunner instanceof Promise) segmentRunner.catch(reject);
			}).catch((err) => onError(segment, err, 'internal error'));
		}
		function onError(segment, err, errType = 'error') {
			if (err instanceof Error == false) err = new Error(err);

			self.message(`<${self.name}>`, `${colors.yellow.bold(`[${segment.name}]`)} ${colors.red.bold(`${errType}:`)} "${err}"`, 'red', 'bgRed');
			self.break(err);
		}
	}

	static create(...args) {
		return new Task(...args);
	}
	static async onceRun(config, ...args) {
		let task = new Task('once', config);

		task._useArgsAsVariables(...args);
		await task._runChain();
	}
}

module.exports = Task;