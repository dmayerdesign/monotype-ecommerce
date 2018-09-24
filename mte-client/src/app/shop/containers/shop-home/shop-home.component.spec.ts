import { HttpClientTestingModule } from '@angular/common/http/testing'
import { async, ComponentFixture, TestBed } from '@angular/core/testing'
import { RouterTestingModule } from '@angular/router/testing'
import { MteHttpModule } from '@mte/common/lib/ng-modules/http'
import { MteInstagramFeedComponent } from '@mte/common/lib/ng-modules/ui/components/instagram-feed/mte-instagram-feed.component'
import { LoginComponent } from '../../../shared/components/login/login.component'
import { SignupComponent } from '../../../shared/components/signup/signup.component'
import { ShopHomeComponent } from './shop-home.component'

describe('ShopHomeComponent', () => {
  let component: ShopHomeComponent
  let fixture: ComponentFixture<ShopHomeComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        MteHttpModule.forRoot(),
        RouterTestingModule.withRoutes([]),
      ],
      declarations: [
        ShopHomeComponent,
        LoginComponent,
        SignupComponent,
        MteInstagramFeedComponent,
      ]
    })
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(ShopHomeComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
