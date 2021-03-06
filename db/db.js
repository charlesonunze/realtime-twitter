const mongoose = require('mongoose');

mongoose.Promise = global.Promise;

mongoose
	.connect('mongodb://root:abc123@ds217560.mlab.com:17560/twitter')
	.then(() => {
		console.log(`connected to database`);
	})
	.catch(e => {
		console.log('DB_ERROR:', e);
	});

module.exports = mongoose;
