const Path = require('path');
const {File: GFile} = require('gulp-util');
const {assert} = require('chai');
const {stub} = require('sinon');

const {emptyTaskConfig} = require('./../mock');
const {Instance, Task, File} = require('./../../src/controllers');

describe('Core: Instance controller', () => {
	let instance, task, instanceCliSetupStub;

	it('Build instance', () => {
		instance = Instance.build();
		instanceCliSetupStub = stub(instance, '_setupCli').callsFake(Function(null));

		assert.instanceOf(instance, Instance);
	});
	it('[useTask]: positive', () => {
		task = instance.useTask('test', emptyTaskConfig);

		assert.instanceOf(task, Task);
	});
	it('[ignoreFileWatching]: positive', () => {
		instance.ignoreFileWatching('/test');

		assert.lengthOf([...instance._ignoreChangesInFiles], 1, 'Has only 1 key');
		assert.isTrue(instance._ignoreChangesInFiles.has('/test'), 'Has "/test" key');
	});
	it('[unignoreFileWatching]: positive', () => {
		instance.unignoreFileWatching('/test');
		assert.lengthOf([...instance._ignoreChangesInFiles], 0);
	});
	it('[unignoreFileWatching]: negative (unignore not existing file)', () => {
		instance.unignoreFileWatching('/test');
		assert.lengthOf([...instance._ignoreChangesInFiles], 0);
	});
});

describe('Core: Task controller', () => {
	let instance, task, instanceCliSetupStub;

	before(() => {
		instance = Instance.build();
		instanceCliSetupStub = stub(instance, '_setupCli').callsFake(Function(null));

		task = instance.useTask('test', emptyTaskConfig);

		assert.instanceOf(instance, Instance, 'Build instance');
		assert.instanceOf(task, Task, 'Build task');
	});

	it('[addFile]: positive (first file)', () => {
		task.addFile('test', Buffer.from(Array(10).fill('test').join()));

		assert.lengthOf([...task._files.keys()], 1, 'Has only 1 key');
		assert.isTrue(task._files.has('test'), 'Has "test" key');
	});
	it('[addFile]: positive (second file)', () => {
		task.addFile('test-2', Buffer.from(Array(10).fill('test').join()));

		assert.lengthOf([...task._files.keys()], 2, 'Has 2 key');
		assert.isTrue(task._files.has('test-2'), 'Has "test-2" key');
	});
	it('[removeFile]: positive', () => {
		task.removeFile('test-2');

		assert.lengthOf([...task._files.keys()], 1);
	});
	it('[removeFiles]: positive', () => {
		task.removeFiles();

		assert.lengthOf([...task._files.keys()], 0);
	});
});

describe('Core: File controller', () => {
	it('Build file', () => {
		const file = File.build('/test', Buffer.from(Array(10).fill('test').join()));

		assert.instanceOf(file, File, 'Instance of File');
		assert.instanceOf(file, GFile, 'Instance of GFile');
	});
	it('[parsePathSegments]: positive', () => {
		const inputPath = '/a/b-c/test.js';
		const {ext, name, full, base, dir} = File.parsePathSegments(inputPath);

		assert.equal(full, Path.normalize(inputPath), 'Full path');
		assert.equal(name, Path.normalize('test'), 'Name');
		assert.equal(ext, Path.normalize('.js'), 'Ext');
		assert.equal(dir, Path.normalize('/a/b-c'), 'Dir');
		assert.equal(base, Path.normalize(`${name}${ext}`), 'Base');
	});
});