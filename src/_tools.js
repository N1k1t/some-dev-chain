const fs = require('fs');
const Path = require('path');
const colors = require('colors/safe');
const {eachFiles, insertValiablesInPath, fsPromise, promiseWrap} = require('./utils');
const {readFile} = fsPromise;

module.exports = {
	// getFiles: async (task, config, next, error) => {
	// 	const glob = require('glob');
	// 	const glopPromise = promiseWrap(glob);

	// 	const {data} = task;
	// 	const paths = config.path instanceof Array ? config.path : [config.path];
	// 	const inputFilesPaths = paths.map(path => insertValiablesInPath(task, path));
	// 	const filePathArrays = await Promise.all(inputFilesPaths.map(path => glopPromise(path, config.globOptions || {})));

	// 	let filePaths = filePathArrays.reduce((map, array) => map.concat(array), []);
	// 	filePaths = filePaths.filter(path => {
	// 		const pathSegments = Path.parse(path);

	// 		if (config.ignoreByFilename && config.ignoreByFilename.test(`${pathSegments.name}${pathSegments.ext}`)) return false;
	// 		return true;
	// 	});

	// 	const files = await Promise.all(filePaths.map(path => readFile(path)));

	// 	files.map((file, key) => task.addFile(filePaths[key], file));
	// 	return next();
	// },
	// getWatchedFile: (task, config, next, error) => {
	// 	const {full, base} = task.input;

	// 	fs.readFile(full, (err, file) => {
	// 		if (err) return error(err);

	// 		task.addFile(full, file);
	// 		next();
	// 	});
	// },
	// browserify: (task, config) => {
	// 	const {files} = task;
	// 	const browserify = require('browserify');
	// 	const syntaxError = require('syntax-error');
	// 	const waitList = [];
	// 	const globalVars = {};
	// 	const customPaths = config.paths || [];

	// 	for (const key in config.globalVars || {}) {
	// 		let variable = config.globalVars[key];

	// 		variable = typeof variable == 'function' ? variable(task) : variable;
	// 		globalVars[key] = () => JSON.stringify(variable);
	// 	}

	// 	for (const [name, file] of files) {
	// 		const syntaxErrorResult = syntaxError(file.contents, file.pathParts.full);
	// 		if (syntaxErrorResult) throw syntaxErrorResult;

	// 		const result = browserify(file, {
	// 			insertGlobalVars: globalVars,
	// 			paths: [Path.normalize(`${process.cwd()}/node_modules`), process.cwd(), file.pathParts.dir, ...customPaths],
	// 			basedir: file.pathParts.dir
	// 		});

	// 		waitList.push(new Promise(resolve => result.bundle((err, result) => {
	// 			if (err) throw `${name}: ${err}`;

	// 			task.addFile(name, result);
	// 			resolve();
	// 		})));
	// 	}

	// 	await Promise.all(waitList);
	// },
	// babel: async (task, config) => {
	// 	const {files} = task;
	// 	const babel = require('babel-core');
	// 	const {type} = config;

	// 	await eachFiles(files, ([name, file], resolve) => {
	// 		let result = '';

	// 		switch(type) {
				
	// 			case 'insert-polifils':
	// 				result = babel.transform(file.contents, {
	// 					presets : ['es2015'],
	// 					plugins : [
	// 						'transform-runtime', 
	// 						'transform-async-to-generator'
	// 					]
	// 				});
	// 				break;
				
	// 			default:
	// 				result = babel.transform(file.contents, {
	// 					presets : ['es2015'], 
	// 					plugins : ['transform-object-assign', 'transform-es2015-template-literals', 'transform-remove-strict-mode']
	// 				});
	// 				break;
	// 		}

	// 		task.addFile(name, result.code);
	// 		resolve();
	// 	});
	// },
	// concat: async (task, config) => {
	// 	let {files} = task;
	// 	let result = '';

	// 	await eachFiles(files, ([name, file], resolve) => {
	// 		result += file.contents + '\n';

	// 		resolve();
	// 	});

	// 	task.removeFiles();
	// 	task.addFile('concat.js', result);
	// },
	// sass: async (task, config, next, error) => {
	// 	let {files} = task;
	// 	let sass = require('node-sass');
	// 	let autoprefixer = require('autoprefixer');
	// 	let postcss = require('postcss');
	// 	let globalVars = '';
	// 	const customPaths = config.paths || [];

	// 	for (let key in config.globalVars) {
	// 		let value = config.globalVars[key];

	// 		globalVars += `$${key}: ${toType(value)};`;
	// 	}

	// 	await eachFiles(files, ([name, file], resolve) => {
	// 		sass.render({
	// 			data: globalVars + file.contents.toString(),
	// 			outputStyle: 'compressed',
	// 			includePaths: [Path.normalize(`${process.cwd()}/node_modules`), process.cwd(), file.pathParts.dir, ...customPaths]
	// 		}, (err, result) => {
	// 			if (err) throw `${name}: ${err}`;

	// 			postcss([ autoprefixer({browsers: ['last 30 versions'], cascade: false}) ]).process(result.css, {from: undefined}).then((result) => {
	// 				task.addFile(name, result.css);
	// 				resolve();
	// 			});
	// 		});
	// 	});

	// 	function toType(value) {
	// 		if (/^[\d]+$|^\#/.test(value)) return value;

	// 		return `'${value}'`;
	// 	}
	// },
	// cssToJs: async (task, config) => {
	// 	let {files} = task;

	// 	await eachFiles(files, ([name, file], resolve) => {
	// 		task.addFile(name, `
	// 			(function() {
	// 				var element = document.createElement("style");

	// 				element.setAttribute("name", "${config.styleName || name.replace(/\\/g, '/')}");
	// 				document.head.appendChild(element).textContent = "${file.contents.toString().replace(/"/g, '\\"').replace(/\n|\r|\t/g,'')}";
	// 			}());
	// 		`.replace(/\n|\r|\t/g,''));
	// 		resolve();
	// 	});
	// },
	// minify: async (task, config) => {
	// 	let {files} = task;
	// 	let UglifyJS = require('uglify-js');
	// 	let csso = require('csso');

	// 	await eachFiles(files, async ([name, file], resolve) => {
	// 		let {ext} = file.pathParts;
	// 		let result = null;
			
	// 		if (ext == '.js') result = await jsMin(name, file);
	// 		if (ext == '.css' || ext == '.scss') result = await cssMin(name, file);

	// 		task.addFile(name, result);
	// 		resolve();
	// 	});

	// 	function jsMin(name, file) {
	// 		return new Promise((resolve) => {
	// 			let result = UglifyJS.minify(file.contents.toString());

	// 			if (result.error) throw `${name}: ${result.error}`;

	// 			resolve(result.code);
	// 		});
	// 	}
	// 	function cssMin(name, file) {
	// 		return new Promise((resolve) => {
	// 			let result = csso.minify(file.contents.toString());

	// 			resolve(result.css);
	// 		});
	// 	}
	// },
	// setVariable: (task, config) => {
	// 	const {value, alias} = config;
	// 	task.variables[alias] = typeof value == 'function' ? value(task) : value;
	// },
	// removeVariable: (task, config) => {
		// const {alias} = config;
		// delete task.variables[alias];
	// },
	// writeFiles: async (task, config, next, error) => {
	// 	let {files} = task;
	// 	let {ignoreRemoveFiles} = config;
	// 	let waitList = [];

	// 	ignoreRemoveFiles = ignoreRemoveFiles || /\)/;

	// 	await eachFiles(files, ([name, file], resolve) => {
	// 		let {dir, ext, name: fileName} = file.pathParts;
	// 		let resultPath = config.path || `${config.dir || dir}/${config.afterDir || ''}/${config.fileName || fileName}${config.prefix ? `-${config.prefix}` : ''}${config.ext || ext}`;

	// 		resultPath = insertValiablesInPath(task, resultPath);
	// 		task.ignoreFileWatchign(resultPath);

	// 		file.writePath = resultPath;

	// 		fs.writeFile(resultPath, file.contents, (err) => {
	// 			if (err) throw err;

	// 			task.unignoreFileWatchign(resultPath);
	// 			if (!ignoreRemoveFiles.test(Path.normalize(`${dir}/${fileName}${ext}`))) task.removeFile(name);

	// 			task.message(`<${task.name}>`, `Writed in ${colors.cyan.bold(resultPath)}`, 'cyan', 'bgBlack');
	// 			resolve();
	// 		});
	// 	});
	// },
	// insertChain: async (task, config) => {
	// 	config.variables = Object.assign(config.variables || {}, task.variables);
	// 	Object.assign(config, {
	// 		isChild: true
	// 	});

	// 	let newTask = new task.constructor(config.alias ? `@${config.alias}` : 'insert', config);
		
	// 	await newTask._run();
	// 	if (newTask.error) throw newTask.error;

	// 	for (let [name, file] of newTask.files) {
	// 		task.addFile(name, file.contents);
	// 	}
	// },
	// insertTask: async (task, config) => {
	// 	const foundedTask = task.allTasks[config.taskName];
	// 	if (!foundedTask) throw `${name}: This task is not unavalible`;

	// 	config.variables = Object.assign(config.variables || {}, task.variables);
	// 	Object.assign(config, {
	// 		isChild: true,
	// 		chain: foundedTask.config.chain
	// 	});

	// 	let newTask = new task.constructor(`@${config.taskName}`, config);

	// 	await newTask._run();

	// 	for (let [name, file] of newTask.files) {
	// 		task.addFile(name, file.contents);
	// 	}
	// },
	// if: (task, config, next, error) => {
	// 	let {variables} = task;

	// 	if ((config.handler && config.handler(task)) || (variables[config.variable] && config.eq.test(variables[config.variable]))) {
	// 		task.mergeChain(config.then);
	// 		return next();
	// 	}
	// 	if (config.else) task.mergeChain(config.else);

	// 	next();
	// },
	// livereload: async (task, config, next, error) => {
	// 	const {reload, changed, checkListen, listen} = require('./livereload-server');
	// 	let {type} = config;
	// 	let {files} = task;

	// 	if (type == 'reload') {
	// 		checkListen(() => reload());
	// 		return next();
	// 	}

	// 	await eachFiles(files, ([name, file], resolve) => {
	// 		checkListen(() => changed(file.writePath));
	// 		resolve();
	// 	});
		
	// 	next();
	// },
	// middleware: (task, config, next, error) => {
	// 	return config.handler(task, config, next, error);
	// },
	// log: (task, config, next, error) => {
	// 	console.dir(task);
	// 	console.log('-------------------------');
	// 	console.dir(config);

	// 	return next();
	// }
}

