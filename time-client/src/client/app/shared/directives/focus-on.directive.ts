import { Directive, OnInit, AfterContentInit, Input, ElementRef, Renderer } from '@angular/core';
import { Router, NavigationEnd, Event as RouterEvent } from '@angular/router';
import { UtilService } from '../services';
import { Observable } from 'rxjs/Observable';

@Directive({
    selector: '[focusOn]'
})
export class FocusOnDirective implements OnInit {
    @Input() focusOn: Observable<boolean>; 

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
                    this.renderer.invokeElementMethod(this.el.nativeElement, 'focus');
                }
            });
        }
    }
}