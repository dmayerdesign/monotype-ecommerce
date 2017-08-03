import * as mongoose from 'mongoose';
const q = require('q');

//use q promises
global.Promise = q.Promise;

export const mongoConnection = {
	connect(done) {
		mongoose.connect(process.env.MONGODB_URI || process.env.MONGOLAB_URI, { useMongoClient: true });
		(<any>mongoose.connection.config).autoIndex = false; // set to false to boost performance in production
		mongoose.connection.on('connected', () => {
			done();
		});
	}
}