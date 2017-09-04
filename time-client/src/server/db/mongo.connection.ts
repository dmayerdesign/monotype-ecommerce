import * as mongoose from 'mongoose'

(<any>mongoose).Promise = global.Promise
if (process.env.ENVIRONMENT === "DEV") mongoose.set('debug', true)

export const mongoConnection = {
	connect(done) {
		mongoose.connect(process.env.MONGODB_URI || process.env.MONGOLAB_URI, { useMongoClient: true })
		mongoose.connection.config['autoIndex'] = true // set to false to boost performance in production
		mongoose.connection.on('connected', () => {
			done()
		})
	}
}