import { AfterContentInit, Directive, ElementRef, Input, OnInit, Renderer } from '@angular/core'
import { Event as RouterEvent, NavigationEnd, Router } from '@angular/router'
import { Observable } from 'rxjs/Observable'

@Directive({
    selector: '[focusOn]'
})
export class FocusOnDirective implements OnInit {
    @Input() public focusOn: Observable<boolean>

    constructor(
        private el: ElementRef,
        private renderer: Renderer,
        private router: Router,
    ) {}

    public ngOnInit() {
        if (this.focusOn) {
            this.focusOn.subscribe(event => {
                if (event) {
                    this.renderer.invokeElementMethod(this.el.nativeElement, 'focus')
                }
            })
        }
    }
}
