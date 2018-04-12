import { arrayProp, prop, MongooseDocument, MongooseSchemaOptions, Ref } from '../../lib/goosetype'
import { UsabilityExperience } from './usability-experience'
import { UsabilityTestBucket } from './usability-test-bucket'

export class UsabilityTest extends MongooseDocument {
    @prop({ ref: UsabilityExperience }) public usabilityExperience: Ref<UsabilityExperience>
    @prop() public description: string
    @arrayProp({ itemsRef: UsabilityTestBucket }) public buckets: number
}

export const UsabilityTestModel = new UsabilityTest().getModel(MongooseSchemaOptions.timestamped)

// Errors.

export class CreateUsabilityTestError extends Error { }
export class FindUsabilityTestError extends Error { }
export class UpdateUsabilityTestError extends Error { }
export class DeleteUsabilityTestError extends Error { }
