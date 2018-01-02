import {
    Component,
    Input,
    OnDestroy,
    OnInit,
    Output,
} from '@angular/core'
import { AbstractControl, FormBuilder, FormGroup } from '@angular/forms'
import { Observable } from 'rxjs/Observable'
import { Subscription } from 'rxjs/Subscription'
import { Copy } from '../../../../constants'

import { AppConfig } from '@time/app-config'
import { ModalType } from '../../../../models/enums/modal-type'
import { IModalData } from '../../../../models/interfaces/ui/modal-data'
import { platform } from '../../utils/platform'
import { timeout } from '../../utils/timeout'

@Component({
    selector: 'time-modal',
    template: `
        <div *ngIf="isShowing && data"
             class="modal-container"
             [ngClass]="[getModalContainerClass()]">
            <div class="modal-darken"
                 [ngStyle]="{'opacity': isFadedIn ? 1 : 0}"
                 (click)="cancel()"></div>
            <div class="modal-inner-wrapper">
                <div class="modal-inner"
                     [ngStyle]="{'opacity': isFadedIn ? 1 : 0}">

                    <header class="modal-title-bar"
                            *ngIf="data.type !== 'banner'">
                        <h2>{{ data.title }}</h2>
                        <button (click)="cancel()" class="blank-btn modal-close-btn">
                            <img alt="close modal" [src]="appConfig.client_url + '/images/x-dark.svg'">
                        </button>
                    </header>

                    <div class="modal-content">

                        <div *ngIf="isAForm()">
                            <form [formGroup]="formGroup"
                                  (submit)="data.form.onSubmit($event)">
                                <!-- Loop through controls and create inputs -->
                            </form>
                        </div>

                        <div *ngIf="isABanner()">
                            <h1>{{ data.title }}</h1>
                            <p class="banner-subtitle">
                                {{ data.banner.subtitle }}
                            </p>
                            <button (click)="data.banner.cta.onClick($event)">
                                {{ data.banner.cta.text }}
                            </button>
                        </div>

                    </div>

                    <footer class="modal-actions"
                         *ngIf="data.type !== modalType.Banner">
                        <button (click)="cancel()" class="btn-cancel modal-cancel">
                            {{ data.cancelText || defaultCancelText }}
                        </button>
                        <button *ngIf="data.okText" (click)="data.okClick()" class="btn-action modal-ok">
                            {{ data.okText }}
                        </button>
                    </footer>
                </div>
            </div>
        </div>
    `,
})
export class TimeModalComponent implements OnInit, OnDestroy {
    @Input() public data$: Observable<IModalData>
    @Input() public closeCallback?: () => void
    public data: IModalData = null
    public defaultCancelText = Copy.Actions.cancel
    public isShowing = false
    public isFadedIn = false
    public appConfig = AppConfig
    public modalType = ModalType
    public formGroup: FormGroup
    private isTransitioning = false
    private modalInner: HTMLElement

    public subscriptions = {
        data: undefined,
        initFadeInTimer: undefined,
        endFadeInTimer: undefined,
        endFadeOutTimer: undefined,
    }

    constructor(
        private formBuilder: FormBuilder
    ) {}

    public ngOnInit() {
        this.subscriptions.data = this.data$.subscribe((data) => this.show(data))
    }

    public ngOnDestroy() {
        Object.keys(this.subscriptions).forEach(key => {
            if (this.subscriptions[key]) {
                (this.subscriptions[key] as Subscription).unsubscribe()
            }
        })
    }

    private show(data: IModalData) {
        if (this.isTransitioning) return
        this.isTransitioning = true
        this.data = data

        if (this.data) {
            if (this.isAForm()) {
                this.createFormGroup()
            }

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

    public updateYPos(scrollTop: number) {
        this.modalInner = <HTMLElement>document.querySelector(".showing .modal-inner-wrapper")
        if (!this.modalInner) return
        this.modalInner.style.top = (scrollTop / 10 + 11).toString() + 'rem'
    }

    public cancel() {
        this.show(null)
    }

    public getModalContainerClass(): string {
        return 'modal-' + this.data.type + '-container'
    }

    // Identifiers.

    public isABanner() {
        return this.data.type === this.modalType.Banner && !!this.data.banner
    }

    public isAForm() {
        return this.data.type === this.modalType.Form && !!this.data.form && !!this.data.form.formObject
    }

    private createFormGroup() {
        this.formGroup = this.formBuilder.group(this.data.form.formObject)
    }
}
