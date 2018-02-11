import { Component, Input, OnInit } from '@angular/core'
import { NavigationItem } from './navigation-item'

@Component({
    selector: 'time-nav-item',
    template: `
        <ng-container *ngFor="let item of items">
            <ng-container *ngTemplateOutlet="navItem; context: { item: item }"></ng-container>

            <ng-template #navItem>
                <li class="nav-item"
                    routerLinkActive="active"
                    [routerLinkActiveOptions]="{ exact: true }">

                    <a #routerLink
                       class="nav-link"
                       [routerLink]="item?.routerLink"
                       (mouseenter)="handleNavLinkMouseEnter(item)"
                       (mouseleave)="handleNavLinkMouseLeave(item)">

                        <span class="nav-link-text">{{ item.text }}</span>
                        <span *ngIf="routerLink.isActive" class="sr-only">(current)</span>

                        <i *ngIf="hasChildren(item)" class="material-icons">keyboard_arrow_down</i>
                    </a>

                    <ul *ngIf="isShowingChildren(item)"
                        (mouseenter)="handleNavLinkMouseEnter(item)"
                        (mouseleave)="handleNavLinkMouseLeave(item)">

                        <ng-container *ngTemplateOutlet="navItem; context: { item: item.children }"></ng-container>
                    </ul>
                </li>
            </ng-template>
        </ng-container>
    `
})
export class TimeNavItemComponent implements OnInit {
    @Input() public items: NavigationItem[]

    public ngOnInit(): void {
        console.log(this.items)
    }

    public hasChildren(item: NavigationItem): boolean {
        return !!item.children && !!item.children.length
    }

    public isShowingChildren(item: NavigationItem): boolean {
        return this.hasChildren(item) && item.showingChildren
    }

    public handleNavLinkMouseEnter(item: NavigationItem): void {
        item.showingChildren = true
    }

    public handleNavLinkMouseLeave(item: NavigationItem): void {
        item.showingChildren = false
    }
}
