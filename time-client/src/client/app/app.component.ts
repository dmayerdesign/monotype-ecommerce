import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';

import { ProductService } from './shared/services';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title: string = 'app';
  products$: Observable<any[]>;

  constructor(
    private productService: ProductService,
  ) {}

  ngOnInit() {
    this.products$ = this.productService.get();
  }
}
