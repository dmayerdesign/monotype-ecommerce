import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ShopPrimaryNavComponent } from './shop-primary-nav.component';

describe('ShopPrimaryNavComponent', () => {
  let component: ShopPrimaryNavComponent;
  let fixture: ComponentFixture<ShopPrimaryNavComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ShopPrimaryNavComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ShopPrimaryNavComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
