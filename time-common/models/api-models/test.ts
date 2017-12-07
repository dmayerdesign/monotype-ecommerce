import { prop, Model } from '../../utils/goosetype'

export class Test extends Model<Test> {
    @prop() public name: string
}

export const TestModel = new Test().getModel()
