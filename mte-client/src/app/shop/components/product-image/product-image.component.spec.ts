import { CommonModule } from '@angular/common'
import { async, ComponentFixture, TestBed } from '@angular/core/testing'
import { WindowRefService } from '@mte/common/lib/ng-modules/ui/services/window-ref.service'
import { Subject } from 'rxjs'
import { ProductImageComponent } from './product-image.component'

describe('ProductImageComponent', () => {
  let component: ProductImageComponent
  let fixture: ComponentFixture<ProductImageComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ CommonModule ],
      providers: [{
        provide: WindowRefService,
        useValue: {
          widths: new Subject<number>()
        }
      }],
      declarations: [ ProductImageComponent ]
    })
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(ProductImageComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
