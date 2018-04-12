import { prop, MongooseDocument, MongooseSchemaOptions, Ref } from '../../lib/goosetype'
import { UsabilityExperience } from './usability-experience'

export class UsabilityTestBucket extends MongooseDocument {
    @prop() public description: string
    @prop({ ref: UsabilityExperience }) public usabilityExperience: Ref<UsabilityExperience>
    @prop() public likelihood: number
}

export const UsabilityTestBucketModel = new UsabilityTestBucket().getModel(MongooseSchemaOptions.timestamped)

// Errors.

export class CreateUsabilityTestBucketError extends Error { }
export class FindUsabilityTestBucketError extends Error { }
export class UpdateUsabilityTestBucketError extends Error { }
export class DeleteUsabilityTestBucketError extends Error { }
