import { Component, OnInit } from '@angular/core'

import { UserService } from '../../services/user.service'

@Component({
    selector: 'time-signup',
    templateUrl: './signup.component.html',
    styleUrls: ['./signup.component.scss']
})
export class SignupComponent implements OnInit {

    constructor(
        private userService: UserService
    ) { }

    public ngOnInit(): void { }

    public doMockSignup() {
        const email = 'hyzer-shop-test@sharklasers.com'
        const password = 'sohcahtoa'
        const passwordConfirmation = password
        const firstName = 'Danny'
        const lastName = 'Mayer'

        this.userService.signup({ email, password, passwordConfirmation, firstName, lastName })
    }

}
