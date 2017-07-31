import { Injectable, Inject } from '@angular/core';
import { Title, DOCUMENT } from '@angular/platform-browser';
 
@Injectable()
export class SEOService {

  private headElement: HTMLElement;
  private metaDescription: HTMLElement;
  private robots: HTMLElement;
 
 /**
  * Inject the Angular 2 Title Service
  * @param titleService
  */
  constructor(
    private titleService: Title,
    @Inject(DOCUMENT) private DOM: any,
  ) {
   /**
    * get the <head> Element
    * @type {any}
    */
    this.headElement = this.DOM.querySelector('head');
    this.metaDescription = this.getOrCreateMetaElement('description');
    this.robots = this.getOrCreateMetaElement('robots');
  }
 
  public getTitle(): string {
    return this.titleService.getTitle();
  }
 
  public setTitle(newTitle: string) {
    this.titleService.setTitle(newTitle);
  }
 
  public getMetaDescription(): string {
    return this.metaDescription.getAttribute('content');
  }
 
  public setMetaDescription(description: string) {
    this.metaDescription.setAttribute('content', description);
  }
 
  public getMetaRobots(): string {
    return this.robots.getAttribute('content');
  }
 
  public setMetaRobots(robots: string) {
    this.robots.setAttribute('content', robots);
  }
 
   /**
    * get the HTML Element when it is in the markup, or create it.
    * @param name
    * @returns {HTMLElement}
    */
    private getOrCreateMetaElement(name: string): HTMLElement {
      let el: HTMLElement;
      el = this.DOM.querySelector('meta[name=' + name + ']');
      if (el === null) {
        el = this.DOM.createElement('meta');
        el.setAttribute('name', name);
        this.headElement.appendChild(el);
      }
      return el;
    }
 
}