import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { ProductsByTermComponent } from './products-by-term.component'

describe('ProductsByTermComponent', () => {
  let component: ProductsByTermComponent
  let fixture: ComponentFixture<ProductsByTermComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProductsByTermComponent ]
    })
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(ProductsByTermComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
