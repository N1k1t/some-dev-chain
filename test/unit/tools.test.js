const Path = require('path');
const {readFile, unlink} = require('fs').promises;
const {assert} = require('chai');

const {srcPath, distPath} = require('../utils');
const {Instance, Task, File, Logger} = require('./../../src/controllers');
const tools = require('../../src/tools');
const {
	writeFiles, 
	getFiles, 
	getWatchedFile,
	setVariable, 
	removeVariable, 
	if: ifTool,
	sass,
	minify,
	browserify,
	typescript,
	babel,
	insertChain
} = tools;

const timestamp = Date.now();
const {
	mainScssResult, 
	moduleScssResult,
	jsBabelResult,
	jsMinifyResult,
	jsBrowserifyResult
} = require('../mock');

Logger.setLevels([]);


describe('Tools: Service', () => {
	let instance, task;

	before(() => {
		instance = Instance.build({tools});
		task = instance.useTask('test', {});

		assert.instanceOf(instance, Instance, 'Build instance');
		assert.instanceOf(task, Task, 'Build task');
	});

	it('[setVariable]: positive', async () => {
		task._reset();

		await setVariable(task, {alias: '$test', value: 'test'});
		await setVariable(task, {alias: '$test-2', value: () => false});

		assert.equal(task.data.variables['$test'], 'test', '$test');
		assert.equal(task.data.variables['$test-2'], false, '$test-2');
	});
	it('[removeVariable]: positive', async () => {
		task._reset();

		await removeVariable(task, {alias: '$test'});
		await removeVariable(task, {alias: '$test-2'});

		assert.lengthOf(Object.keys(task.data.variables), 0);
	});
	it('[if]: positive (with variable "is")', async () => {
		task._reset();

		await setVariable(task, {alias: '$test', value: true});
		await ifTool(task, {variable: '$test', is: true, then: [{name: 'setVariable'}]});

		assert.equal(task.data.variables['$test'], true, '$test');
		assert.lengthOf(task._mergering, 1, 'Task mergering has 1 segment');
	});
	it('[if]: positive (with variable "eq")', async () => {
		task._reset();

		await setVariable(task, {alias: '$test', value: 'test'});
		await ifTool(task, {variable: '$test', eq: /test/, then: [{name: 'setVariable'}]});

		assert.equal(task.data.variables['$test'], 'test', '$test');
		assert.lengthOf(task._mergering, 1, 'Task mergering has 1 segment');
	});
	it('[if]: positive (with handler)', async () => {
		task._reset();

		await ifTool(task, {handler: () => true, then: [{name: 'setVariable'}]});
		assert.lengthOf(task._mergering, 1, 'Task mergering has 1 segment');
	});
	it('[getWatchedFile]: positive', async () => {
		task._reset();

		task.setInputFilePath(`${srcPath}/main.js`);
		await getWatchedFile(task);

		assert.lengthOf([...task.files.keys()], 1);
	});
	it('[insertChain]: positive', async () => {
		task._reset();

		const chain = [
			{name: 'middleware', handler: subTask => subTask.setInputFilePath(`${srcPath}/main.js`)},
			{name: 'getWatchedFile'},
			{name: 'getFiles', path: `${srcPath}/*.scss`}
		];

		await insertChain(task, {chain});
		assert.lengthOf([...task.files.keys()], 3);
	});
});

describe('Tools: Output', () => {
	let instance, task;

	before(() => {
		instance = Instance.build();
		task = instance.useTask('test', {});

		assert.instanceOf(instance, Instance, 'Build instance');
		assert.instanceOf(task, Task, 'Build task');
	});
	after(async () => {
		await unlink(`${distPath}/test.txt`);
		await unlink(`${distPath}/main-${timestamp}.css`);
		await unlink(`${distPath}/module-${timestamp}.css`);
		await unlink(`${distPath}/main-${timestamp}.js`);
		await unlink(`${distPath}/main-${timestamp}-min.js`);
		await unlink(`${distPath}/module-${timestamp}.js`);
	});

	it('[writeFiles]: positive', async () => {
		task._reset();

		const contents = Buffer.from(Array(10).fill('test').join());

		task.addFile(`${distPath}/test.txt`, contents);
		await writeFiles(task);

		const file = await readFile(`${distPath}/test.txt`);
		assert.equal(file.toString(), contents.toString());
	});
	it('[getFiles]: positive (path)', async () => {
		task._reset();

		await getFiles(task, {path: `${srcPath}/main.scss`});
		assert.lengthOf([...task.files.keys()], 1);
	});
	it('[getFiles]: positive (path with variable)', async () => {
		task._reset();

		await setVariable(task, {alias: '$name', value: 'module'})
		await getFiles(task, {path: `${srcPath}/($name).scss`});
		
		assert.lengthOf([...task.files.keys()], 1);
	});
	it('[getFiles]: positive (minmatch)', async () => {
		task._reset();

		await getFiles(task, {path: `${srcPath}/*.scss`});
		assert.lengthOf([...task.files.keys()], 2);
	});
	it('[sass]: positive (globalVars)', async () => {
		task._reset();

		await getFiles(task, {path: `${srcPath}/main.scss`});
		await sass(task, {globalVars: {color: '#333'}});
		await writeFiles(task, {prefix: timestamp, dir: distPath, ext: '.css'});

		const file = await readFile(`${distPath}/main-${timestamp}.css`);
		assert.equal(file.toString(), mainScssResult);
	});
	it('[babel]: positive', async () => {
		task._reset();

		await getFiles(task, {path: `${srcPath}/main.js`});
		await babel(task)
		await writeFiles(task, {prefix: timestamp, dir: distPath});

		const file = await readFile(`${distPath}/main-${timestamp}.js`);
		assert.equal(file.toString(), jsBabelResult);
	});
	it('[minify]: positive (sass)', async () => {
		task._reset();

		await getFiles(task, {path: `${srcPath}/module.scss`});
		await sass(task, {globalVars: {color: '#333'}});
		await minify(task);
		await writeFiles(task, {prefix: timestamp, dir: distPath, ext: '.css'});

		const file = await readFile(`${distPath}/module-${timestamp}.css`);
		assert.equal(file.toString(), moduleScssResult);
	});
	it('[minify]: positive (js ES5)', async () => {
		task._reset();

		await getFiles(task, {path: `${srcPath}/main.js`});
		await babel(task)
		await minify(task);
		await writeFiles(task, {prefix: `${timestamp}-min`, dir: distPath});

		const file = await readFile(`${distPath}/main-${timestamp}-min.js`);
		assert.equal(file.toString(), jsMinifyResult);
	});
	it('[browserify]: positive (globalVars)', async () => {
		task._reset();

		await getFiles(task, {path: `${srcPath}/module.js`});
		await browserify(task, {globalVars: {a: true}})
		await writeFiles(task, {prefix: timestamp, dir: distPath});

		const file = await readFile(`${distPath}/module-${timestamp}.js`);
		assert.equal(file.toString().replace(/\r|\t|\n/g, ''), jsBrowserifyResult.replace(/\r|\n|\t/g, ''));
	});
});