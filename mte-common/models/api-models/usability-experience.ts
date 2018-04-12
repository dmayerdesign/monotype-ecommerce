import { prop, MongooseDocument, MongooseSchemaOptions } from '../../lib/goosetype'

export class UsabilityExperience extends MongooseDocument {
    @prop() public description: string
}

export const UsabilityExperienceModel = new UsabilityExperience().getModel(MongooseSchemaOptions.timestamped)

// Errors.

export class CreateUsabilityExperienceError extends Error { }
export class FindUsabilityExperienceError extends Error { }
export class UpdateUsabilityExperienceError extends Error { }
export class DeleteUsabilityExperienceError extends Error { }
