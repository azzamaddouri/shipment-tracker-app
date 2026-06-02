import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CarrierDeliveriesComponent } from './carrier-deliveries.component';

describe('CarrierDeliveriesComponent', () => {
  let component: CarrierDeliveriesComponent;
  let fixture: ComponentFixture<CarrierDeliveriesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CarrierDeliveriesComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CarrierDeliveriesComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
