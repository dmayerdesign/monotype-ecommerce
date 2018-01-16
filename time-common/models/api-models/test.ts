import { prop, MongooseDocument } from '../../lib/goosetype'

export class Test extends MongooseDocument<Test> {
    @prop() public name: string
}

export const TestModel = new Test().getModel()
