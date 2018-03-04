import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, Input, OnDestroy, ViewChild } from '@angular/core'
import { ImageHelper } from '@mte/common/helpers/image.helper'
import { AutoUnsubscribe } from '@mte/common/lib/auto-unsubscribe'
import { WindowRefService } from '@mte/common/ng-modules/ui/services/window-ref.service'
import { Subscription } from 'rxjs/Subscription'

@Component({
    selector: 'mte-product-image',
    template: `
        <div class="product-image-container"
             [ngStyle]="getContainerStyles()">

            <div *ngIf="hasMagnifier"
                 class="product-image-magnified"
                 [ngStyle]="getMagnifiedStyles()"
                 [ngClass]="getMagnifiedClasses()">
            </div>

            <div #productImage
                 *ngIf="hasMagnifier"
                 class="product-image"
                 [ngStyle]="getStyles()"
                 (mouseenter)="handleMouseEnter()"
                 (mouseleave)="handleMouseLeave()"
                 (mousemove)="handleMouseMove($event)">
            </div>

            <div #productImage
                 *ngIf="!hasMagnifier"
                 class="product-image"
                 [ngStyle]="getStyles()">
            </div>
        <div>
    `,
    styleUrls: ['./product-image.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
@AutoUnsubscribe()
export class ProductImageComponent implements AfterViewInit, OnDestroy {
    @ViewChild('productImage') public productImageElement: ElementRef
    @Input() public src: string
    @Input() public alt = 'Product image'
    @Input() public hasMagnifier = false

    private widthToHeightRatio = 1 / 1
    private imageWidthEms: number
    private imageHeightEms: number
    private mouseIsOver = false
    private magnifiedTranslateX = 0
    private magnifiedTranslateY = 0
    private magnifiedWidthEms = 80
    private magnifiedHeightEms = 80

    public windowWidthSubscription: Subscription

    constructor(
        private windowRefService: WindowRefService,
        private changeDetectorRef: ChangeDetectorRef
    ) {
        this.windowWidthSubscription = this.windowRefService.widths.subscribe(() => {
            this.imageHeightEms = this.calculateHeight()
        })
    }

    public ngAfterViewInit(): void {
        this.imageHeightEms = this.calculateHeight()
        this.changeDetectorRef.detectChanges()
    }

    public ngOnDestroy(): void { }

    public getStyles(): object {
        return {
            backgroundImage: `url(${this.src})`,
            opacity: this.isMagnified() ? 0 : 1,
            height: this.getHeight()
        }
    }

    public getContainerStyles(): object {
        return {
            height: this.getHeight()
        }
    }

    public getMagnifiedStyles(): object {
        return {
            backgroundImage: `url(${ImageHelper.getLargeImage(this.src)})`,
            transform: `translate(${this.getMagnifiedTranslate()})`,
            width: this.magnifiedWidthEms + 'em',
            height: this.magnifiedHeightEms + 'em',
        }
    }

    public getMagnifiedClasses(): string[] {
        return [
            this.isMagnified() ? '' : 'not-active',
        ]
    }

    public isMagnified(): boolean {
        return this.hasMagnifier && this.mouseIsOver
    }

    public getMagnifiedTranslate(): string {
        return `${this.magnifiedTranslateX}em, ${this.magnifiedTranslateY}em`
    }

    public getHeight(): string {
        if (this.imageHeightEms) {
            return this.imageHeightEms + 'em'
        }
        else {
            return 'auto'
        }
    }

    public calculateHeight(): number {
        if (!this.productImageElement) {
            return 0
        }
        return (this.productImageElement.nativeElement.offsetWidth / this.widthToHeightRatio)
            / this.windowRefService.htmlFontSizePx
    }

    public handleMouseEnter(): void {
        this.mouseIsOver = true
    }

    public handleMouseLeave(): void {
        this.mouseIsOver = false
        this.magnifiedTranslateX = 0
        this.magnifiedTranslateY = 0
    }

    public handleMouseMove(event: MouseEvent): void {
        const xRatio = this.magnifiedWidthEms / this.imageWidthEms
        const yRatio = this.magnifiedHeightEms / this.imageHeightEms
        const mouseX = event.offsetX
        const mouseY = event.offsetY

        this.magnifiedTranslateX = -(xRatio * (mouseX / 10)) + (this.imageWidthEms / 2)
        this.magnifiedTranslateY = -(yRatio * (mouseY / 10)) + (this.imageHeightEms / 2)
    }
}
