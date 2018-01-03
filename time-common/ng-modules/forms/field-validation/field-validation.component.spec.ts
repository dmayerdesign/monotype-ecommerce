import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { TimeFieldValidationComponent } from './field-validation.component'

describe('TimeFieldValidationComponent', () => {
  let component: TimeFieldValidationComponent
  let fixture: ComponentFixture<TimeFieldValidationComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TimeFieldValidationComponent ]
    })
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(TimeFieldValidationComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
