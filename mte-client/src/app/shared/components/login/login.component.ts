import { Component, OnInit } from '@angular/core'

import { UserService } from '../../../services/user.service'

@Component({
    selector: 'mte-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

    constructor(
        private userService: UserService
    ) { }

    public ngOnInit(): void {}

    public doMockLogin() {
        const email = 'hyzer-shop-test@sharklasers.com'
        const password = 'sohcahtoa'

        this.userService.login({ email, password })
    }
}
