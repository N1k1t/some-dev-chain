const fs = require('fs');
const Async = require('some-async-chain');
const Path = require('path');
const colors = require('colors/safe');
const { eachFiles, parsePath } = require('./utils.js');

module.exports = {
	getFiles: (task, config, next, error) => {
		let { data } = task;

		if ( config.path ) return getFileByPath();

		function getFileByPath(){
			let path = parsePath(task, config.path);

			fs.readFile(path, (err, file) => {
				if ( err ) return error(`${path}: ${err}`);

				task.writeFile(path, file);
				next();
			});
		}
	},
	getWatchedFile: (task, config, next, error) => {
		let { full, base } = task.input;

		fs.readFile(full, (err, file) => {
			if ( err ) return error(err);

			task.writeFile(full, file);
			next();
		});
	},
	browserify: (task, config, next, error) => {
		let { files } = task;
		let browserify = require('browserify');
		let waitList = [];
		let globalVars = {};

		for ( let key in config.globalVars || {} ){
			let variable = config.globalVars[key];

			variable = typeof variable == 'function' ? variable(task) : variable;
			globalVars[key] = () => JSON.stringify(variable);
		}

		for ( let [name, file] of files ){
			waitList.push(Async.createPromise((resolve) => browserify(file, {
				insertGlobalVars: globalVars
			}).bundle((err, result) => {
				if ( err ) return error(`${name}: ${err}`);

				task.writeFile(name, result);
				resolve();
			})));
		}

		Promise.all(waitList).then(() => next());
	},
	babel: async (task, config, next, error) => {
		let { files } = task;
		let babel = require('babel-core');

		await eachFiles(files, config, ([name, file], resolve) => {
			let result = babel.transform(file.contents, {
				presets : ['es2015'], 
				plugins : ['transform-es2015-template-literals','transform-object-assign', 'transform-remove-strict-mode']
			});

			task.writeFile(name, result.code);
			resolve();
		});

		next();
	},
	concat: async (task, config, next, error) => {
		let { files } = task;
		let result = '';

		await eachFiles(files, config, ([name, file], resolve) => {
			result += file.contents + '\n';

			resolve();
		});

		task.removeFiles();
		task.writeFile('concat.js', result);

		next();
	},
	sass: async (task, config, next, error) => {
		let { files } = task;
		let sass = require('node-sass');
		let autoprefixer = require('autoprefixer');
		let postcss = require('postcss');
		let globalVars = '';

		for ( let key in config.globalVars ){
			let value = config.globalVars[key];

			globalVars += `$${key}: ${toType(value)};`;
		}

		await eachFiles(files, config, ([name, file], resolve) => {
			sass.render({
				data: globalVars + file.contents.toString(),
				outputStyle: 'compressed',
			}, (err, result) => {
				if ( err ) return error(`${name}: ${err}`);

				postcss([ autoprefixer({ browsers: ['last 30 versions'], cascade: false }) ]).process(result.css, { from: undefined }).then((result) => {
					task.writeFile(name, result.css);
					resolve();
				});
			});
		});

		next();

		function toType(value){
			if ( /^[\d]+$|^\#/.test(value) ) return value;

			return `'${value}'`;
		}
	},
	cssToJs: async (task, config, next, error) => {
		let { files } = task;

		await eachFiles(files, config, ([name, file], resolve) => {
			task.writeFile(name, `document.head.appendChild(document.createElement("style","${name}")).textContent = "${file.contents.toString().replace(/"/g, '\\"').replace(/\n|\r|\t/g,'')}";`);
			resolve();
		});

		next();
	},
	minify: async (task, config, next, error) => {
		let { files } = task;
		let UglifyJS = require('uglify-js');
		let csso = require('csso');

		await eachFiles(files, config, async ([name, file], resolve) => {
			let { ext } = file.pathParts;
			let result = null;
			
			if ( ext == '.js' ) result = await jsMin(name, file);
			if ( ext == '.css' || ext == '.scss' ) result = await cssMin(name, file);

			task.writeFile(name, result);
			resolve();
		});

		next();

		function jsMin(name, file){
			return Async.createPromise((resolve) => {
				let result = UglifyJS.minify(file.contents.toString());

				if ( result.error ) return error(`${name}: ${result.error}`);

				resolve(result.code);
			});
		}
		function cssMin(name, file){
			return Async.createPromise((resolve) => {
				let result = csso.minify(file.contents.toString());

				resolve(result.css);
			});
		}
	},
	setVariable: (task, config, next, error) => {
		let { value, alias } = config;

		task.variables[alias] = typeof value == 'function' ? value(task) : value;
		
		next();
	},
	removeVariable: (task, config, next, error) => {
		let { alias } = config;

		delete task.variables[alias];
		
		next();
	},
	writeFiles: async (task, config, next, error) => {
		let { files } = task;
		let waitList = [];

		await eachFiles(files, config, ([name, file], resolve) => {
			let { dir, ext, name: fileName } = file.pathParts;
			let resultPath = config.path || `${config.dir || dir}${config.afterDir || ''}${config.fileName || fileName}${config.prefix ? `-${config.prefix}` : ''}${config.ext || ext}`;

			resultPath = parsePath(task, resultPath);
			task.ignoreFileWatchign(resultPath);

			fs.writeFile(resultPath, file.contents, (err) => {
				if ( err ) return error(err);

				task.unignoreFileWatchign(resultPath);
				task.removeFile(name);

				task.message(`<${task.name}>`, `Writed in ${colors.cyan.bold(resultPath)}`, 'cyan', 'bgBlack');
				resolve();
			});
		});

		next();
	},
	insertChain: async (task, config, next, error) => {
		config.variables = Object.assign(config.variables || {}, task.variables);
		Object.assign(config, {
			isChild: true
		});

		let newTask = new task.constructor(config.alias ? `@${config.alias}` : 'insert', config);

		await newTask._runChain();

		for ( let [name, file] of newTask.files ){
			task.writeFile(name, file.contents);
		}

		next();
	},
	insertTask: async (task, config, next, error) => {
		let foundedTask = task.allTasks[config.taskName];

		if ( !foundedTask ) return error(`${name}: This task is not unavalible`);

		config.variables = Object.assign(config.variables || {}, task.variables);
		Object.assign(config, {
			isChild: true,
			chain: foundedTask.config.chain
		});

		let newTask = new task.constructor(`@${config.taskName}`, config);

		await newTask._runChain();

		for ( let [name, file] of newTask.files ){
			task.writeFile(name, file.contents);
		}

		next();
	},
	if: (task, config, next, error) => {
		let { variables } = task;

		if ( variables[config.variable] && config.eq.test(variables[config.variable]) ) {
			task.mergeChain(config.then);

			return next();
		}
		if ( config.else ) task.mergeChain(config.else);

		next();
	},
	livereload: async (task, config, next, error) => {
		const { reload, checkListen, listen } = require('./livereload-server');
		let { type } = config;
		let { files } = task;

		if ( type == 'reload' ) {
			checkListen(() => reload());
			next();
		}

		await eachFiles(files, config, ([name, file], resolve) => {
			console.log(name);
		});
		
		next();
	}
}

