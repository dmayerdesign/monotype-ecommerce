import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, Input, OnDestroy, OnInit, ViewChild } from '@angular/core'
import { ImageHelper } from '@mte/common/helpers/image.helper'
import { Heartbeat } from '@mte/common/lib/heartbeat/heartbeat.decorator'
import { WindowRefService } from '@mte/common/lib/ng-modules/ui/services/window-ref.service'
import { BootstrapBreakpoint } from '@mte/common/models/enums/bootstrap-breakpoint'
import { Observable } from 'rxjs/Observable'

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
@Heartbeat()
export class ProductImageComponent implements AfterViewInit, OnInit, OnDestroy {
    private isAlive = false

    @ViewChild('productImage') public productImageElement: ElementRef
    @Input() public src: string
    @Input() public alt = 'Product image'
    @Input() public hasMagnifier = false

    private widthToHeightRatio = 1 / 1
    private imageWidthPx: number
    private imageHeightPx: number
    private mouseIsOver = false
    private magnifiedTranslateXEm = 0
    private magnifiedTranslateYEm = 0
    private magnifiedWidthEms = 80
    private magnifiedHeightEms = 80

    constructor(
        private windowRefService: WindowRefService,
        private changeDetectorRef: ChangeDetectorRef
    ) {}

    public ngOnInit(): void {
        this.breakpointHasBeenHits(this.windowRefService.widths.pairwise())
            .takeWhile(() => this.isAlive)
            .subscribe(() => {
                if (this.productImageElement) this.updateImageSize()
            })
    }

    public ngAfterViewInit(): void {
        this.updateImageSize()
        this.changeDetectorRef.detectChanges()
    }

    public ngOnDestroy(): void { }

    public updateImageSize(): void {
        this.changeDetectorRef.markForCheck()
        this.imageWidthPx = this.productImageElement.nativeElement.offsetWidth
        this.imageHeightPx = this.calculateHeight()
        this.src = this.imageWidthPx < 250
            ? ImageHelper.getThumbnailImage(this.src)
            : ImageHelper.getLargeImage(this.src)
    }

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

    public breakpointHasBeenHits(obs: Observable<number[]>): Observable<boolean> {
        return obs.map(([prevWidth, currentWidth]) =>
            Object.keys(BootstrapBreakpoint)
                .filter((x) => !isNaN(parseFloat(x)))
                .map((x) => parseFloat(x))
                .some((breakpoint) =>
                    (prevWidth > breakpoint && currentWidth <= breakpoint)
                    || (prevWidth <= breakpoint && currentWidth > breakpoint)
                )
        )
    }

    public getMagnifiedTranslate(): string {
        return `${this.magnifiedTranslateXEm}em, ${this.magnifiedTranslateYEm}em`
    }

    public getHeight(): string {
        if (this.imageHeightPx) {
            return this.imageHeightPx + 'px'
        }
        else {
            return 'auto'
        }
    }

    public calculateHeight(): number {
        if (!this.productImageElement) {
            return 0
        }
        return (this.imageWidthPx / this.widthToHeightRatio)
    }

    public handleMouseEnter(): void {
        this.mouseIsOver = true
    }

    public handleMouseLeave(): void {
        this.mouseIsOver = false
        this.magnifiedTranslateXEm = 0
        this.magnifiedTranslateYEm = 0
    }

    public handleMouseMove(event: MouseEvent): void {
        const xRatio = this.magnifiedWidthEms / this.imageWidthPx
        const yRatio = this.magnifiedHeightEms / this.imageHeightPx
        const mouseX = event.offsetX
        const mouseY = event.offsetY

        this.magnifiedTranslateXEm = -((xRatio * mouseX) + (this.imageWidthPx / 2) / 10)
        this.magnifiedTranslateYEm = -((yRatio * mouseY) + (this.imageHeightPx / 2) / 10)
    }
}
