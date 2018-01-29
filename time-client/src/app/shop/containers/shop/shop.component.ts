import { AfterViewInit, Component, OnInit, TemplateRef, ViewChild } from '@angular/core'
import { FormControl, FormGroup, Validators } from '@angular/forms'
import { Observable } from 'rxjs/Observable'

import { Product } from '@time/common/models/api-models/product'
import { ModalType } from '@time/common/models/enums/modal-type'
import { TimeFormBuilderService } from '@time/common/ng-modules/forms/services/form-builder.service'
import { SimpleError } from '@time/common/ng-modules/http'
import { UiService, UserService } from '../../../shared/services'
import { ProductService } from '../../services'

@Component({
    selector: 'shop',
    templateUrl: './shop.component.html',
    styleUrls: ['./shop.component.scss'],
})
export class ShopComponent implements OnInit, AfterViewInit {
    public products: Observable<Product[]>
    public theProducts: Product[]
    public productsError: SimpleError

    // [BEGIN] Sample banner modal
    @ViewChild('bannerModal') public bannerModalTemplate: TemplateRef<any>
    private bannerModalForm = this.timeFormBuilder.create({
        name: {
            label: 'Name',
            defaultValue: '',
        },
        email: {
            label: 'Email',
            defaultValue: '',
            validators: [ Validators.email, Validators.required ],
        }
    })
    private bannerModalFormGroup = this.bannerModalForm.formGroup
    public bannerModalContext = {
        modalFormSubmitted: (event: Event) => {
            console.log('Form submitted!')
            console.log(this.constructor.name)
            console.log(event)
        },
        sampleForm: this.bannerModalForm,
        sampleFormGroup: this.bannerModalFormGroup,
    }
    // [END] Sample banner modal

    constructor(
        private productService: ProductService,
        private userService: UserService,
        private ui: UiService,
        private timeFormBuilder: TimeFormBuilderService
    ) { }

    public ngOnInit(): void {
        this.productService.get()
        this.productService.getSource.subscribe((data) => console.log(data))
    }

    public ngAfterViewInit() {
        this.products = this.productService.getSource
        this.productService.getErrorSource.subscribe(err => console.log('Error in shop component', err))
    }

    public doAModalThing() {
        this.ui.showModal({
            title: 'Shop great deals',
            type: ModalType.Default,
            banner: {
                cta: {
                    text: 'Shop now',
                    onClick: (event?: Event) => {
                        console.log('Clicked!', this)
                    },
                },
            },
            content: this.bannerModalTemplate,
            context: this.bannerModalContext,
        })
    }

    public doAToastThing() {
        this.ui.flash('Hello!')
    }

}
