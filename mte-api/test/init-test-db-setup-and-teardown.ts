import { Connection } from 'mongoose'
import { establishDbConnection } from '../data-access/establish-db-connection'
require('dotenv').config()

export function initTestDbSetupAndTeardown() {
    let dbConnection: Connection

    beforeAll(async (done) => {
        dbConnection = await establishDbConnection(process.env.MONGODB_URI_TEST)
        done()
    })

    afterAll(async (done) => {
        await dbConnection.close()
        dbConnection.on('disconnected', done)
    })
}
