import {
    Component,
    Input,
    OnDestroy,
    OnInit,
    Output,
} from '@angular/core'
import { Observable } from 'rxjs/Observable'
import { Subscription } from 'rxjs/Subscription'

import { AppConfig } from '@time/app-config'
import { IModalData } from '../../../../models/interfaces/ui/modal-data'
import { platform } from '../../utils/platform'
import { timeout } from '../../utils/timeout'

@Component({
    selector: 'time-modal',
    template: `
        <div *ngIf="isShowing && data"
             class="modal-container">
            <div class="modal-darken"
                 [ngStyle]="{'opacity': isFadedIn ? 1 : 0}"
                 (click)="cancel()"></div>
            <div class="modal-inner-wrapper">
                <div class="modal-inner"
                     [ngStyle]="{'opacity': isFadedIn ? 1 : 0}">
                    <div class="modal-title-bar">
                        <h2>{{ data.title }}</h2>
                        <button (click)="cancel()" class="blank-btn modal-close-btn">
                            <img alt="close modal" [src]="_config.client_url + '/images/x-dark.svg'">
                        </button>
                    </div>
                    <div class="modal-content" *ngIf="data.body">
                        <ng-container *compile="data.body; context: data.context"></ng-container>
                    </div>
                    <div class="modal-actions">
                        <button (click)="cancel()" class="btn-cancel modal-cancel">
                            {{ data.cancelText || defaultCancelText }}
                        </button>
                        <button *ngIf="data.okText" (click)="data.okClick()" class="btn-action modal-ok">
                            {{ data.okText }}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `,
})
export class TimeModalComponent implements OnInit, OnDestroy {
    @Input() public data$: Observable<IModalData>
    @Input() public closeCallback?: () => void
    public data: IModalData = null
    public defaultCancelText = "Cancel"
    public isShowing = false
    public isFadedIn = false
    public _config = AppConfig
    private isTransitioning = false
    private modalInner: HTMLElement

    public subscriptions = {
        data: undefined,
        initFadeInTimer: undefined,
        endFadeInTimer: undefined,
        endFadeOutTimer: undefined,
    }

    public ngOnInit() {
        this.subscriptions.data = this.data$.subscribe((data) => this.show(data))
    }

    private show(data: IModalData) {
        if (this.isTransitioning) return
        this.isTransitioning = true
        this.data = data

        if (data) {
            this.isShowing = true
            this.subscriptions.initFadeInTimer = timeout(10).subscribe(() => {
                if (platform.isBrowser()) {
                    this.updateYPos(window.scrollY)
                }
                this.isFadedIn = true
            })
            this.subscriptions.endFadeInTimer = timeout(400).subscribe(() => {
                this.isTransitioning = false
            })
        }
        else {
            this.isFadedIn = false
            this.subscriptions.endFadeOutTimer = timeout(400).subscribe(() => {
                this.isShowing = false
                this.isTransitioning = false
                if (this.closeCallback) {
                    this.closeCallback()
                }
            })
        }
    }

    public ngOnDestroy() {
        Object.keys(this.subscriptions).forEach(key => {
            if (this.subscriptions[key] as Subscription) {
                this.subscriptions[key].unsubscribe()
            }
        })
    }

    public updateYPos(scrollTop: number): any {
        this.modalInner = <HTMLElement>document.querySelector(".showing .modal-inner-wrapper")
        if (!this.modalInner) return
        this.modalInner.style.top = (scrollTop / 10 + 11).toString() + 'rem'
    }

    public cancel() {
        this.show(null)
    }
}
