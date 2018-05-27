import { async, ComponentFixture, TestBed } from '@angular/core/testing'
import 'jasmine'

import { CheckoutComponent } from './checkout.component'

describe('CheckoutComponent', () => {
  let component: CheckoutComponent
  let fixture: ComponentFixture<CheckoutComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CheckoutComponent ]
    })
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(CheckoutComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should be created', () => {
    expect(component).toBeTruthy()
  })
})