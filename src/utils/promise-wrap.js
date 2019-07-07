module.exports = promiseWrap;


function promiseWrap(fn) {
	return (...args) => new Promise(res => {
		fn(...args, (error, ...resultArgs) => {
			if (error) throw error;
			return res(...resultArgs);
		});
	});
}