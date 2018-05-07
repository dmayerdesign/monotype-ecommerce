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
        const arrayElement = data[customRegion.dataArrayProperty]
            .find(lookUpProperty(customRegion.pathToDataArrayPropertyLookupKey))
        if (!!arrayElement) {
            return `${arrayElement[customRegion.pathToDataPropertyValue]}`
        }
        return ''
    }

    public static getCustomRegionHtml(customRegion: CustomRegion, data: any): string {
        const delimiter = '{}'

        const parseHtmlString = (_customRegion: CustomRegion, _data: any): string => {
            const value = this.getCustomRegionTextValueFromArrayProperty(_customRegion, _data)

            if (!_customRegion.template) return value
            return _customRegion.template.split(delimiter).join(value)
        }

        if (customRegion.isMetaRegion && !!customRegion.childRegions) {
            const childRegionsMap: { [key: string]: string } = {}
            let parsedTemplate = customRegion.template
            customRegion.childRegions.forEach((childRegion) => {
                childRegionsMap[childRegion.key] = parseHtmlString(childRegion, data)
            })
            Object.keys(childRegionsMap).forEach((key) => {
                const interpolationMatch = customRegion.template.match(new RegExp('\\{\\{(\\s)*' + key + '(\\s)*\\}\\}', 'g'))
                const childRegionParsedHtml = childRegionsMap[key]
                if (!!interpolationMatch) {
                    interpolationMatch.forEach((match) => parsedTemplate = parsedTemplate.replace(match, childRegionParsedHtml))
                }
            })
            return parsedTemplate
        } else {
            return parseHtmlString(customRegion, data)
        }
    }
}
