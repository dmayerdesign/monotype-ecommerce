import { Inject, Injectable } from '@angular/core'
import { DOCUMENT, Title } from '@angular/platform-browser'
import { AppConfig } from '@time/app-config'

@Injectable()
export class SeoService {

    private headElement: HTMLElement
    private metaDescription: HTMLElement
    private robots: HTMLElement

    constructor(
        private titleService: Title,
        @Inject(DOCUMENT) private DOM: any,
    ) {
        this.headElement = this.DOM.querySelector('head')
        this.metaDescription = this.getOrCreateMetaElement('description')
        this.robots = this.getOrCreateMetaElement('robots')
    }

    public getTitle(): string {
        return this.titleService.getTitle()
    }

    public setTitle(newTitle: string): void {
        this.titleService.setTitle(newTitle + ' | ' + AppConfig.brand_name)
    }

    public getMetaDescription(): string {
        return this.metaDescription.getAttribute('content')
    }

    public setMetaDescription(description: string): void {
        this.metaDescription.setAttribute('content', description)
    }

    public getMetaRobots(): string {
        return this.robots.getAttribute('content')
    }

    public setMetaRobots(robots: string): void {
        this.robots.setAttribute('content', robots)
    }

	/**
     * Get the HTML Element when it is in the markup, or create it.
     * @param name
     * @returns {HTMLElement}
     */
    private getOrCreateMetaElement(name: string): HTMLElement {
        let el: HTMLElement
        el = this.DOM.querySelector('meta[name=' + name + ']')
        if (el == null) {
            el = this.DOM.createElement('meta')
            el.setAttribute('name', name)
            this.headElement.appendChild(el)
        }
        return el
    }

}
