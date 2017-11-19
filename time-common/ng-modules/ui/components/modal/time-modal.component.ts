import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    EventEmitter,
    Input,
    Output,
} from '@angular/core'

import { IModalData } from '../../../../models/interfaces/ui/modal-data'

@Component({
    selector: 'time-modal',
    template: `
        <div *ngIf="data" class="modal-container" [hidden]="!isShowing" [ngClass]="{'showing': isShowing}">
            <div class="modal-darken" [ngStyle]="{'opacity': fadeIn ? 1 : 0}" (click)="show = false"></div>
            <div *ngIf="data" class="modal-inner-wrapper">
                <div class="modal-inner" [ngStyle]="{'opacity': fadeIn ? 1 : 0}">
                    <div class="modal-title-bar">
                        <h2>{{ data.title }}</h2>
                        <button class="blank-btn modal-close-btn" (click)="show = false"><img alt="close modal" src="static/images/x-dark.svg"></button>
                    </div>
                    <div class="modal-content" *ngIf="data.body">
                        <ng-container *compile="data.body; context: data.context"></ng-container>
                    </div>
                    <div class="modal-actions">
                        <button (click)="cancel()" class="btn-cancel modal-cancel">{{ data.cancelText || defaultCancelText }}</button>
                        <button *ngIf="data.okText" (click)="data.okClick()" class="btn-action modal-ok">{{ data.okText }}</button>
                    </div>
                </div>
            </div>
        </div>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TimeModalComponent {
    @Input() public data: IModalData
    @Input() public closeCallback: () => void
    @Output() public showChange = new EventEmitter<boolean>()
    public defaultCancelText = "Cancel"
    public isShowing: boolean
    private isTransitioning: boolean
    public fadeIn: boolean
    private modalInner: HTMLElement

    @Input() public get show(): boolean {
        return this.isShowing
    }
    public set show(isShowing: boolean) {
        if (this.isTransitioning) return
        if (!this.data) return
        this.isTransitioning = true

        if (isShowing) {
            this.isShowing = true
            setTimeout(() => {
                this.updateYPos(window.scrollY)
                this.fadeIn = true
            }, 10)
            setTimeout(() => {
                this.isTransitioning = false
            }, 400)
            this.showChange.emit(this.isShowing)
        }
        else {
            this.fadeIn = false
            setTimeout(() => {
                this.isShowing = false
                this.showChange.emit(this.isShowing)
                this.isTransitioning = false
                if (this.closeCallback) {
                    this.closeCallback()
                }
            }, 400)
        }
    }

    constructor(
        private cd: ChangeDetectorRef,
    ) { }

    public updateYPos(scrollTop: number): any {
        this.modalInner = <HTMLElement>document.querySelector(".showing .modal-inner-wrapper")
        if (!this.modalInner) return
        this.modalInner.style.top = (scrollTop / 10 + 11).toString() + 'rem'
        this.cd.detectChanges()
    }

    public cancel() {
        this.show = false
    }
}
