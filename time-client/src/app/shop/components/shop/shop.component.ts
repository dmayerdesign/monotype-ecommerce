import { AfterViewInit, Component, OnInit } from '@angular/core'
import { FormControl, FormGroup } from '@angular/forms'
import { Observable } from 'rxjs/Observable'

import { Product } from '@time/common/models/api-models/product'
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

    public ngOnInit() {
        this.productService.get()
    }

    public ngAfterViewInit() {
        this.products$ = this.productService.get$
        this.productService.get$.subscribe(
            products => {
                this.products = products
            },
        )
        this.productService.getError$.subscribe(err => console.log("Error in shop component", err))
    }

    public doAModalThing() {
        const testForm = new FormGroup({
            name: new FormControl('')
        })

        this.ui.showModal({
            title: "Hello!",
            body: `
            <form [formGroup]="testForm" (submit)="submit($event)">
                <input formControlName="name" />
                <button>Submit</button>
            </form>`,
            context: {
                testForm,
                submit(event) {
                    event.preventDefault()
                    console.log(testForm.value)
                }
            }
        })
    }

    public doAToastThing() {
        this.ui.flash('Hello!')
    }

}
