import { Inject, Injectable } from '@angular/core'
import { DOCUMENT } from '@angular/platform-browser'

import { platform } from '@time/common/ng-modules/ui/utils/platform'
import { UiService } from './ui.service'

@Injectable()
export class SeoService {

    private headElement: HTMLElement
    private metaDescription: HTMLElement
    private robots: HTMLElement

    constructor(
        private ui: UiService,
        @Inject(DOCUMENT) private DOM: any,
    ) {
        if (platform.isBrowser()) {
            this.headElement = this.DOM.querySelector('head')
        }
        else {
            this.headElement = new HTMLElement()
        }

        this.metaDescription = this.getOrCreateMetaElement('description')
        this.robots = this.getOrCreateMetaElement('robots')
    }

    public getTitle(): string {
        return this.ui.getTitle()
    }

    public setTitle(newTitle: string) {
        this.ui.setTitle(newTitle)
    }

    public getMetaDescription(): string {
        return this.metaDescription.getAttribute('content')
    }

    public setMetaDescription(description: string) {
        this.metaDescription.setAttribute('content', description)
    }

    public getMetaRobots(): string {
        return this.robots.getAttribute('content')
    }

    public setMetaRobots(robots: string) {
        this.robots.setAttribute('content', robots)
    }

	/**
     * Get the HTML Element when it is in the markup, or create it.
     * @param name
     * @returns {HTMLElement}
     */
    private getOrCreateMetaElement(name: string): HTMLElement {
        if (platform.isBrowser()) {
            let el: HTMLElement
            el = this.DOM.querySelector('meta[name=' + name + ']')
            if (el == null) {
                el = this.DOM.createElement('meta')
                el.setAttribute('name', name)
                this.headElement.appendChild(el)
            }
            return el
        }
        else {
            return new HTMLElement()
        }
    }

}
