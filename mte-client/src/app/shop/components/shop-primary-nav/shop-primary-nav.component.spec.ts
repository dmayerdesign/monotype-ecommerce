import { HttpClientTestingModule } from '@angular/common/http/testing'
import { async, ComponentFixture, TestBed } from '@angular/core/testing'
import { RouterTestingModule } from '@angular/router/testing'
import { MteHttpModule } from '@mte/common/lib/ng-modules/http'
import { MteNavigationListComponent } from '@mte/common/lib/ng-modules/ui/components/navigation/mte-navigation-list.component'
import { WindowRefService } from '@mte/common/lib/ng-modules/ui/services/window-ref.service'
import 'jasmine'
import { Subject } from 'rxjs'
import { ShopPrimaryNavComponent } from './shop-primary-nav.component'

describe('ShopPrimaryNavComponent', () => {
  let component: ShopPrimaryNavComponent
  let fixture: ComponentFixture<ShopPrimaryNavComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule.withRoutes([]),
        HttpClientTestingModule,
        MteHttpModule.forRoot(),
      ],
      providers: [
        {
          provide: WindowRefService,
          useValue: {
            widths: new Subject(),
            mediaBreakpointAbove() { return false },
            mediaBreakpointBelow() { return false },
          }
        }
      ],
      declarations: [ ShopPrimaryNavComponent, MteNavigationListComponent ]
    })
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(ShopPrimaryNavComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
