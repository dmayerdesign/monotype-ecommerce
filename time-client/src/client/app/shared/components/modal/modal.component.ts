import {
	Component,
	OnInit,
	Input,
	Output,
	EventEmitter,
	ChangeDetectorRef,
} from '@angular/core';

@Component({
	selector: 'modal',
	template: `
<div class="modal-container" [hidden]="!isShowing" [ngClass]="{'showing': isShowing}">
	<div class="modal-darken" [ngStyle]="{'opacity': fadeIn ? 1 : 0}" (click)="show = false"></div>
	<div class="modal-inner-wrapper">
		<div class="modal-inner" [ngStyle]="{'opacity': fadeIn ? 1 : 0}">
			<div class="modal-title-bar">
				<h2>{{title}}</h2>
				<button class="blank-btn modal-close-btn" (click)="show = false"><img alt="close modal" src="static/images/x-dark.svg"></button>
			</div>
			<div class="modal-content">
				<ng-content></ng-content>
			</div>
		</div>
	</div>
</div>`,
	styles: [require('./modal.component.scss')],
})
export class ModalComponent implements OnInit {
	private isShowing: boolean;
	private isTransitioning: boolean;
	private fadeIn: boolean;
	private modalInner: HTMLElement;
	@Input() closeModalCallback: (...args: any[]) => any;
	@Input() title: string;
	@Output() showChange = new EventEmitter<boolean>();

	@Input() get show(): boolean {
		return this.isShowing;
	}
	set show(isShowing: boolean) {
		if (this.isTransitioning) return;
		this.isTransitioning = true;

		if (isShowing) {
			this.isShowing = true;
			setTimeout(() => {
				this.updateYPos(window.scrollY);
				this.fadeIn = true;
			}, 10);
			setTimeout(() => {
				this.isTransitioning = false;
			}, 400);
			this.showChange.emit(this.isShowing);
		}
		else {
			this.fadeIn = false;
			console.log("closing");
			console.log(this.closeModalCallback);
			setTimeout(() => {
				this.isShowing = false;
				this.showChange.emit(this.isShowing);
				this.isTransitioning = false;
				if (this.closeModalCallback) {
					this.closeModalCallback();
				}
			}, 400);
		}
	}

	constructor(
		private cd: ChangeDetectorRef,
	) {}

	ngOnInit() {
		
	}

	// initSticky() {
	// 	let last_known_scroll_position: number = window.scrollY;
	// 	let ticking: boolean = false;
	// 	const setYPos = (e?: MouseWheelEvent) => {
	// 		last_known_scroll_position = <number>window.scrollY;
	// 		if (!ticking) {
	// 			window.requestAnimationFrame(() => {
	// 				this.updateYPos(last_known_scroll_position);
	// 				ticking = false;
	// 			});
	// 		}
	// 		ticking = true;
	// 	}
	// 	setYPos();
	// 	window.addEventListener("scroll", (e: MouseWheelEvent) => {
	// 		setYPos(e);
	// 	});
	// }

	updateYPos(scrollTop: number): any {
		this.modalInner = <HTMLElement>document.querySelector(".showing .modal-inner-wrapper");
		console.log("Modal inner", this.modalInner);
		if (!this.modalInner) return;
		this.modalInner.style.top = (scrollTop / 10 + 11).toString() + 'rem';
		this.cd.detectChanges();
	}
}