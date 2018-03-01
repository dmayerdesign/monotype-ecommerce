import { Component, Input } from '@angular/core'

@Component({
    selector: 'mte-product-image',
    template: `
        <div class="product-image-container"
             [ngStyle]="getContainerStyles()">

            <div class="product-image-magnified"
                 [ngStyle]="getMagnifiedStyles()"
                 [ngClass]="getMagnifiedClasses()">
            </div>

            <div class="product-image"
                [ngStyle]="getStyles()"
                (mouseenter)="handleMouseEnter()"
                (mouseleave)="handleMouseLeave()"
                (mousemove)="handleMouseMove($event)">
            </div>
        <div>
    `,
    styleUrls: ['./product-image.component.scss']
})
export class ProductImageComponent {
    @Input() public src: string
    @Input() public alt = 'Product image'
    @Input() public hasMagnifier = true

    private mouseIsOver = false
    private magnifiedTranslateX = 0
    private magnifiedTranslateY = 0
    private magnifiedWidthEms = 80
    private magnifiedHeightEms = 80
    private originalWidthEms = 20
    private originalHeightEms = 20

    public getStyles(): object {
        return {
            backgroundImage: `url(${this.src})`,
            opacity: this.isMagnified() ? 0 : 1,
        }
    }

    public getContainerStyles(): object {
        return {
            width: this.originalWidthEms + 'em',
            height: this.originalHeightEms + 'em',
        }
    }

    public getMagnifiedStyles(): object {
        return {
            backgroundImage: `url(${this.getSrcForLargeImage()})`,
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

    public getSrcForLargeImage(): string {
        return this.src
            .replace('-thumbnail.', '-medium.')
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
        const xRatio = this.magnifiedWidthEms / this.originalWidthEms
        const yRatio = this.magnifiedHeightEms / this.originalHeightEms
        const mouseX = event.offsetX
        const mouseY = event.offsetY

        this.magnifiedTranslateX = -(xRatio * (mouseX / 10)) + (this.originalWidthEms / 2)
        this.magnifiedTranslateY = -(yRatio * (mouseY / 10)) + (this.originalHeightEms / 2)
    }
}
