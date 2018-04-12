import { prop, MongooseDocument } from '../../lib/goosetype'

export class Test extends MongooseDocument {
    @prop() public name: string
}

export const TestModel = new Test().getModel()

export class CreateTestError extends Error { }
export class FindTestError extends Error { }
export class UpdateTestError extends Error { }
export class DeleteTestError extends Error { }
