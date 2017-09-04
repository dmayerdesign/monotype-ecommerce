import { Component, OnInit } from '@angular/core'
import { UiService } from './shared/services/ui.service'
import { ToastrService } from 'ngx-toastr'
import { IFlash } from './shared/services/ui.service'

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title: string = 'app';

  constructor(
    private ui: UiService,
    private toastr: ToastrService,
  ) {}

  ngOnInit() {
    console.log("On app init");
    this.ui.flash$.subscribe(flash => this.showToast(flash))
  }

  showToast(flash: IFlash) {
    // If running on the server, don't attempt DOM manipulation
    if (!document) return
    // Need to wrap in a `setTimeout` to avoid `ExpressionChangedAfterItHasBeenCheckedError`
    setTimeout(() => this.toastr[flash.type](flash.message))
  }
}
