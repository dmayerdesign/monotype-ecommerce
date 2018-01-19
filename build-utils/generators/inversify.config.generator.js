// 1: recursive tree of directories
//     a: recursively loop through directories
//     b: create classes

class Directory {
    constructor(parentPath) {
        this.name = this.constructor.name || ''
        this.fullPath = parentPath + '/' + this.name
        this.children = []
    }
}

const directories = []

// --------------------------------------------------------------------------------------------------------------
import { Container } from 'inversify'
import { interfaces, TYPE } from 'inversify-express-utils'
import { makeLoggerMiddleware } from 'inversify-logger-middleware'

import { Tags, Types } from '@time/common/constants/inversify'
import { MongooseDocument } from '@time/common/lib/goosetype'

