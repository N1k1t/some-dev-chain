const {writeFile} = require('fs').promises;

const Path = require('path');
const {File: GFile} = require('gulp-util');

class File extends GFile{
	constructor(path, contents) {
		const pathSegments = File.parsePathSegments(path);
		const {base, full} = pathSegments;

		super({cwd: `${process.cwd()}\\${path}`, base, path, contents});

		Object.assign(this, {
			name: base,

			_path: full,
			_pathSegments: pathSegments,
			_writePath: null,
			_isWrited: false,
			_args: new Set()
		});

		this.setContents(contents);
	}

	get path() {
		return this._path;
	}
	get contents() {
		return this._contents;
	}
	get writePath() {
		return this._writePath;
	}
	get isWrited() {
		return this._isWrited;
	}
	get pathSegments() {
		return this._pathSegments;
	}
	get args() {
		return this._args;
	}

	setContents(contents) {
		return this._contents = contents instanceof Buffer ? contents : Buffer.from(contents)
	}
	setWritePath(path) {
		this._writePath = path;
	}
	setName(name) {
		const {dir, ext} = this.pathSegments;

		this._pathSegments.name = name;
		this.setWritePath(`${dir}/${name}${ext}`);
	}

	async write() {
		const writePath = this.writePath || this.path;
		
		await writeFile(writePath, this.contents);
		return this._isWrited = true;
	}

	static build(path, contents) {
		return new File(path, contents);
	}
	static parsePathSegments(path) {
		const full = Path.normalize(path);
		return {...Path.parse(full), full};
	}
}

module.exports = File;