import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
	selector: 'tooltip',
	template: `
<div class="tooltip"
		*ngIf="isShowing"
		[ngClass]="{'showing': isShowing}"
		[ngStyle]="{'opacity': fadeIn ? 1 : 0}">
	<ng-content></ng-content>
</div>`,
	styles: [require('./tooltip.component.scss')],
})
export class TooltipComponent {
	public isShowing: boolean;
	public fadeIn: boolean;
	@Output() showChange = new EventEmitter<boolean>();

	@Input() get show(): boolean {
		return this.isShowing;
	}
	set show(isShowing: boolean) {
		if (isShowing) {
			this.isShowing = true;
			setTimeout(() => { this.fadeIn = true }, 10);
			this.showChange.emit(this.isShowing);
		}
		else {
			this.fadeIn = false;
			setTimeout(() => {
				this.isShowing = false;
				this.showChange.emit(this.isShowing);
			}, 400);
		}
	}
}