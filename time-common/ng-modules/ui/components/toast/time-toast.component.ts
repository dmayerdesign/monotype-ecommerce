import { Component, Input, OnDestroy, OnInit } from '@angular/core'
import { Observable } from 'rxjs/Observable'
import { ReplaySubject } from 'rxjs/ReplaySubject'
import { Subscription } from 'rxjs/Subscription'
import 'rxjs/add/operator/delay'

import { AppConfig } from '@time/app-config'
import { IToast } from '../../../../models/interfaces/ui/toast'
import { timeout } from '../../utils/timeout'

@Component({
    selector: 'time-toast',
    template: `
        <div *ngIf="isShowing"
             class="toast-container toast-type-{{ toast.type }}">
            <div class="toast-inner"
                 [ngClass]="{
                     'is-faded-in': isFadedIn
                 }">

                <button class="blank-btn toast-close-btn" (click)="close()">
                    <img alt="close toast" [src]="_config.client_url + '/images/x-dark.svg'">
                </button>

                <p class="toast-content">
                    {{ toast.message }}
                </p>
            </div>
        </div>
    `,
    styleUrls: [ './time-toast.component.scss' ],
})
export class TimeToastComponent implements OnInit, OnDestroy {
    @Input() public toast$: Observable<IToast>

    public queue: IToast[] = []
    public toast: IToast
    public toastSubscription: Subscription
    public isShowing = false
    public isFadedIn = false
    public _config = AppConfig

    public subscriptions = {
        fadeInDelay: undefined,
        toastTimeout: undefined,
        showToastDelay: undefined,
    }

    constructor() { }

    public ngOnInit() {
        if (this.toast$) {
            this.toastSubscription = this.toast$.subscribe(toast => {
                this.queueToast(toast)
                this.showToast()
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

    private queueToast(toast: IToast) {
        this.queue.push(toast)
    }

    private showToast(wasQueued?: boolean) {
        const delay = wasQueued ? 200 : 0

        if (this.subscriptions.showToastDelay) {
            this.subscriptions.showToastDelay.unsubscribe()
        }

        this.subscriptions.showToastDelay = timeout(delay).subscribe(() => {
            this.toast = this.queue[0]
            this.isShowing = true

            if (this.subscriptions.fadeInDelay) {
                this.subscriptions.fadeInDelay.unsubscribe()
            }
            if (this.subscriptions.toastTimeout) {
                this.subscriptions.toastTimeout.unsubscribe()
            }

            this.subscriptions.fadeInDelay = timeout(10).subscribe(() => {
                this.isFadedIn = true
            })

            this.subscriptions.toastTimeout = timeout(this.toast.timeout).subscribe(() => {
                this.endToast()
            })
        })
    }

    private endToast() {
        this.isShowing = false
        this.isFadedIn = false
        this.queue.shift()

        if (this.subscriptions.toastTimeout) {
            this.subscriptions.toastTimeout.unsubscribe()
        }
        if (this.queue.length) {
            this.showToast(true)
        }
    }

    public close() {
        this.endToast()
    }
}
