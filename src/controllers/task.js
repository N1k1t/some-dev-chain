const colors = require('colors/safe');
const File = require('./file');

class Task{
	constructor(instance, config) {
		const {name, isChild, chain, description, data} = config;
		const {buildLogger} = instance;

		this._reset();

		Object.assign(this, {
			name,
			description,
			config,
			data: {...this.data, ...data},

			_instance: instance,
			_logger: buildLogger(name),
			_chain: chain,
			_isChild: !!isChild
		});
	}

	get error() {
		return this._error;
	}
	get logger() {
		return this._logger;
	}
	get chain() {
		return this._chain;
	}
	get files() {
		return this._files;
	}
	get instance() {
		return this._instance;
	}
	get inputFilePaths() {
		return [...this._inputFiles];
	}

	break(reason = null) {
		this._isRunning = false;
		this._isBreaked = true;

		if (reason instanceof Error) return this._error = reason;
		if (reason) this.logger.info(`Breaked with reason: ${reason}`);
	}
	setInputFilePath(path) {
		return this._inputFiles.add(path);
	}

	addFile(path, contents) {
		if (this.files.has(path)) return this.files.get(path).setContents(contents);
		return this.files.set(path, File.build(path, contents));
	}
	removeFile(path) {
		this.files.delete(path);
	}
	removeFiles(regexPattern) {
		if (!regexPattern) { };

		return this.files.clear()
	}

	mergeChain(chain) {
		this._mergering = this._mergering.concat(chain);
	}

	async run(data) {
		const {chain} = this;
		const uptime = Date.now();

		if (this._isRunning) return false;
		
		this.logger.info(colors.gray('Started ...'), 'gray', 'bgBlack');

		Object.assign(this, {
			data: {...this.data, ...data},

			_files: new Map(),
			_uptime: uptime,
			_currentSegmentNum: 0,
			_isRunning: true,
			_isBreaked: false,
			_error: null
		});

		for (const key in chain) {
			const segment = chain[key];

			if (this._isBreaked) continue;
			this._currentSegmentNum = key;
			
			await this._runSegment(segment).catch(error => this._handleSegmentError(error, segment));

			for (const mergeringSegment of this._mergering) {
				if (this._isBreaked) continue;
				await this._runSegment(mergeringSegment).catch(error => this._handleSegmentError(error, segment));
			}

			this._mergering = [];
		}

		const message = `${this.error ? 'Failure' : 'Succesfull'} by ${colors.green.bold(`${(Date.now() - uptime) / 1000}s`)}${this._isChild ? '' : '\n'}`;
		this.logger.success(message, 'green', 'bgGreen');
		this.break();

		Object.assign(this, {
			data: {variables: {}},

			_inputFiles: new Set(),
			_mergering: []
		});
	}

	_runSegment(segment) {
		const {tools} = this.instance;

		if (!tools[segment.name]) return this.logger.error(`Tool [${segment.name}] is unavalible`);
		return tools[segment.name](this, segment);
	}
	_handleSegmentError(error, segment) {
		error = error instanceof Error ? error : new Error(error);
		this.logger.error(`${colors.yellow.bold(`[${segment.name}]`)} "${error}"`);
		return this.break(error);
	}
	_reset() {
		Object.assign(this, {
			data: {variables: {}},
			
			_inputFiles: new Set(),
			_files: new Map(),
			_currentSegmentNum: 0,
			_isRunning: false,
			_isBreaked: false,
			_mergering: [],
			_error: null
		});
	}

	static build(instance, config) {
		return new Task(instance, config);
	}
}

module.exports = Task;