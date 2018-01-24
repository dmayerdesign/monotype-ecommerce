import { AfterViewInit, Component, OnInit } from '@angular/core'
import { FormControl, FormGroup } from '@angular/forms'
import { Observable } from 'rxjs/Observable'

import { Product } from '@time/common/models/api-models/product'
import { ModalType } from '@time/common/models/enums/modal-type'
import { SimpleError } from '@time/common/ng-modules/http'
import { UiService, UserService } from '../../../shared/services'
import { ProductService } from '../../services'

@Component({
    selector: 'shop',
    templateUrl: './shop.component.html',
    styleUrls: ['./shop.component.scss'],
})
export class ShopComponent implements OnInit, AfterViewInit {
    public products$: Observable<Product[]>
    public products: Product[]
    public productsError: SimpleError

    constructor(
        private productService: ProductService,
        private userService: UserService,
        private ui: UiService,
    ) { }

    public ngOnInit(): void {
        this.productService.get()
    }

    public ngAfterViewInit() {
        this.products$ = this.productService.get$
        this.productService.get$.subscribe(
            products => {
                this.products = products
            },
        )
        this.productService.getError$.subscribe(err => console.log('Error in shop component', err))
    }

    public doAModalThing() {
        const self = this
        const testForm = new FormGroup({
            name: new FormControl('')
        })

        this.ui.showModal({
            title: 'Shop great deals',
            type: ModalType.Banner,
            banner: {
                cta: {
                    text: 'Shop now',
                    onClick(event?: Event) {
                        console.log('Clicked!')
                        console.log('What is this?', self)
                    },
                },
            },
        })
    }

    public doAToastThing() {
        this.ui.flash('Hello!')
    }

}
