import { CustomRegion } from '../models/api-models/custom-region'

export class CustomRegionsHelper {
    public static getCustomRegionTextValueFromArrayProperty(customRegion: CustomRegion, data: any): string {
        function lookUpProperty(pathToDataArrayPropertyLookupKey: string): (prop: any) => any {
            return function(prop: any): any {
                let value = prop
                pathToDataArrayPropertyLookupKey.split('.').forEach((key) => {
                    value = value[key]
                })
                return value === customRegion.dataArrayPropertyLookupValue
            }
        }
        const value = data[customRegion.dataArrayProperty]
            .find(lookUpProperty(customRegion.pathToDataArrayPropertyLookupKey))[customRegion.pathToDataPropertyValue]
        return `${value}`
    }
}
