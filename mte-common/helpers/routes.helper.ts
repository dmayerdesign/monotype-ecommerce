import { Type } from '@angular/core'
import { Routes } from '@angular/router'
import { ComponentWithRouteMetadata, RouteComponentMetadata } from '@mte/common/models/interfaces/ui/route-component-metadata'

export function buildRoutesFromMeta(componentsWithMetadata: (Type<any> & ComponentWithRouteMetadata)[]): Routes {
    const routes = componentsWithMetadata.map((component) => {
        const { path, title } = component.meta
        return {
            component,
            path,
            data: {
                title,
            },
        }
    })
    return [
        ...routes
    ]
}
