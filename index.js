const fs = require('fs');
const colors = require('colors/safe');
const commander = require('commander-without-exit');
const readline = require('readline');
const glob = require('glob');
const chokidar = require('chokidar');
const Async = require('some-async-chain');
const tools = require('./tools');
const Path = require('path');
const gutil = require('gulp-util');

const tasks = {};
const ignoreChangesInFiles = [];

commander
	.command('task')
	.description('check task')
	.option('-l, --list', 'show list of tasks')
	.action((params) => {
		// TODO
	});

readline.createInterface({
	input: process.stdin,
	output: process.stdout,
	terminal: false
}).on('line', (line) => commander.parse([...process.argv, ...line.split(' ')]));

class Task{
	constructor(name, config){
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
		});

		if ( config.isChild ) return false;
		if ( config.watch ) this.watch(config.watch);
		if ( config.runFromCli ) setupTaskCli();

		function setupTaskCli(){
			commander
				.command(`${name} ${self.config.cliVars.split(' ').map(value => `<${value.substr(1)}>`).join(' ')}`)
				.description(config.description)
				.action((...args) => onTaskCliAction(...args));
		}
		function onTaskCliAction(...input){
			let args = [...input];
			let taskName = args[0];

			args.pop();
			
			self._useArgsAsVariables(...args);
			self._runChain();
		}
	}

	watch({ minmatch, ignore }){
		this._watcher = chokidar.watch(minmatch, {
			ignored: ignore,
		});

		this._watcher.on('change', (path) => {
			const pathSegments = Path.parse(path);

			if (ignoreChangesInFiles.indexOf(path) > -1) return false;
			if (this.config.watch.ignoreByFilename && this.config.watch.ignoreByFilename.test(`${pathSegments.name}${pathSegments.ext}`)) return false;
			if (this.config.watch.ignoreByPath && this.config.watch.ignoreByPath.test(path)) return false;

			this.message('[Watcher]', `${colors.magenta.bold(path)} - has been changed`, 'magenta', 'bgMagenta');
			this._runChain(Object.assign(pathSegments, { full: path }));
		});
	}
	break(){
		this.isRunning = false;
		this.isBreaked = true;
	}
	message(header, message, borderColor, taskColor){
		let result = '';

		result += `${colors.bold[borderColor || 'green']('|')} ${colors.gray(new Date().toLocaleTimeString())} ${colors[taskColor || 'bgCyan'].white.bold(` ${header} `)}\t${colors.gray('>')}`;
		result += ` ${colors.bold(message)}`;
		
		process.stdout.write(`${result}\n`);
	}

	ignoreFileWatchign(path){
		ignoreChangesInFiles.push(path);
	}
	unignoreFileWatchign(path){
		let index = ignoreChangesInFiles.indexOf();

		if ( index == -1 ) return false;

		ignoreChangesInFiles.splice(index, 1);
	}

	writeFile(path, file){
		this.files.set(path, this._createFile(path, file instanceof Buffer ? file : Buffer.from(file)));
	}
	removeFile(path){
		this.files.delete(path);
	}
	removeFiles(regexPattern){
		if ( !regexPattern ) return this.files.clear();
	}
	mergeChain(chain){
		this.merge = this.merge.concat(chain);
	}
	_createFile(path, contents){
		let pathParts = Path.parse(path);

		return Object.assign(new gutil.File({ cwd: `${__dirname}\\${path}` , base: pathParts.base || '' , path: path , contents: contents }), {
			pathParts: pathParts
		});
	}
	_useArgsAsVariables(...args){
		let cliVars = this.config.cliVars.split(' ');

		for ( let key in args ){
			let value = args[key];

			Object.assign(this.config.variables, {
				[cliVars[key]]: value
			});
		}
	}
	async run(config){
		// TODO
	}
	async _runChain(input, cb = Function(null)){
		let { chain, variables, isChild } = this.config;
		let upTime = new Date().getTime();
		let self = this;

		if ( this.isRunning ) return false;
		
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

		for ( let key in chain ){
			if ( this.isBreaked ) continue;

			let segment = chain[key];

			this.currentSegmentNum = key;

			await runSegment(segment);

			for ( let mergeSegment of this.merge ){
				if ( this.isBreaked ) continue;
				await runSegment(mergeSegment);
			}
			this.merge = [];
		}

		this.message(`<${this.name}>`, `${ this.error ? 'Failure' : 'Succesfull' } by ${colors.green.bold(`${(new Date().getTime() - upTime) / 1000} s`)}${isChild ? '' : '\n'}`, 'green', 'bgGreen');
		this.break();

		cb(this);

		function runSegment(segment){
			return Async.createPromise((resolve, reject) => {
				if ( !tools[segment.name] ) return this.message(`<${this.name}>`, colors.red.bold(`Tool [${segment.name}] is unavalible`), 'red', 'bgRed');

				tools[segment.name](self, segment, resolve, (err) => {
					self.message( `<${self.name}>`, `${colors.yellow.bold(`[${segment.name}]`)} ${colors.red.bold('error:')} "${err}"`, 'red', 'bgRed');
					self.break();
					self.error = err;

					reject();
				});
			}).catch((err) => {
				if ( !err ) return false;
				self.message( `<${self.name}>`, `${colors.yellow.bold(`[${segment.name}]`)} ${colors.red.bold('internal error:')} "${err}"`, 'red', 'bgRed');

				self.break();
				self.error = err;
			});
		}
	}

	get allTasks(){
		return tasks
	}

	static create(...args){
		return new Task(...args);
	}
	static async onceRun(config, ...args){
		let task = new Task('once', config);

		task._useArgsAsVariables(...args);
		await task._runChain();
	}
}

module.exports = {
	init: (inputTasks) => {
		for ( let key in inputTasks ){
			let config = inputTasks[key];

			tasks[key] = createTask(key, config);
		}

		commander.help();
	},
	createTask: createTask,
	registerTool: (name, handler) => {
		Object.assign(tools, { [name]: handler });
	},
	onceTaskRun: async (config, ...args) => {
		await Task.onceRun(config, ...args);

		process.exit(0);
	},
	Task: Task,
	tools: tools
};

function createTask(name, config){
	return Task.create(name, config);
}