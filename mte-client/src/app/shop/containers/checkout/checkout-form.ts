import { Validators } from '@angular/forms'

export const checkoutForm = {
    firstName: {
        label: 'First name',
        defaultValue: '',
    },
    lastName: {
        label: 'Last name',
        defaultValue: '',
        validators: [ Validators.required ]
    },
    email: {
        label: 'Email',
        defaultValue: '',
        validators: [ Validators.email, Validators.required ],
    },
    shippingAddressStreet1: {
        label: 'Street Address',
        defaultValue: '',
        validators: [ Validators.required ],
    },
    shippingAddressStreet2: {
        label: 'Apt/Suite',
        defaultValue: '',
        validators: [ Validators.required ],
    },
    shippingAddressCity: {
        label: 'City',
        defaultValue: '',
        validators: [ Validators.required ],
    },
    shippingAddressState: {
        label: 'State',
        defaultValue: '',
        validators: [ Validators.required ],
    },
    shippingAddressZip: {
        label: 'Postal code',
        defaultValue: '',
        validators: [ Validators.required ],
    },
    billingAddressStreet1: {
        label: 'Street Address',
        defaultValue: '',
        validators: [ Validators.required ],
    },
    billingAddressStreet2: {
        label: 'Apt/Suite',
        defaultValue: '',
        validators: [ Validators.required ],
    },
    billingAddressCity: {
        label: 'City',
        defaultValue: '',
        validators: [ Validators.required ],
    },
    billingAddressState: {
        label: 'State',
        defaultValue: '',
        validators: [ Validators.required ],
    },
    billingAddressZip: {
        label: 'Postal code',
        defaultValue: '',
        validators: [ Validators.required ],
    },
}
