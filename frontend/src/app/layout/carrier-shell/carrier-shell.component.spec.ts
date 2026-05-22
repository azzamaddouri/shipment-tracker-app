import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CarrierShellComponent } from './carrier-shell.component';

describe('CarrierShellComponent', () => {
  let component: CarrierShellComponent;
  let fixture: ComponentFixture<CarrierShellComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CarrierShellComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CarrierShellComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
