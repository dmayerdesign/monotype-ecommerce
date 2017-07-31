import { Directive, OnInit, AfterContentInit, Input, ElementRef, Renderer } from '@angular/core';
import { Router, NavigationEnd, Event as RouterEvent } from '@angular/router';
import { UtilService } from '../services';
import { Subject } from 'rxjs';

@Directive({
    selector: '[focusOn]'
})
export class FocusOnDirective implements OnInit {
    @Input() focusOn: Subject<boolean>; 

    constructor(
    	private el: ElementRef,
    	private renderer: Renderer,
    	private router: Router,
        private util: UtilService,
    ) {}
    
    ngOnInit() {
        if (this.focusOn) {
            this.focusOn.subscribe(event => {
                if (event) {
                    // this.renderer.setElementAttribute(this.el.nativeElement, 'tabindex', '-1');
                    this.renderer.invokeElementMethod(this.el.nativeElement, 'focus');
                }
            });
        }
        else {
            console.log("Chillin");
            // this.renderer.setElementAttribute(this.el.nativeElement, 'tabindex', '-1');
            // this.renderer.invokeElementMethod(this.el.nativeElement, 'focus');
        }
        // setTimeout(() => {
        // 	this.renderer.setElementAttribute(this.el.nativeElement, 'tabindex', '-1');
        // }, 500);
    }
}