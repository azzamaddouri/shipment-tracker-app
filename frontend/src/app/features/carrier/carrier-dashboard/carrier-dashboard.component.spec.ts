import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CarrierDashboardComponent } from './carrier-dashboard.component';

describe('CarrierDashboardComponent', () => {
  let component: CarrierDashboardComponent;
  let fixture: ComponentFixture<CarrierDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CarrierDashboardComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CarrierDashboardComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
