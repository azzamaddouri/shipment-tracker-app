import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OperatorShellComponent } from './operator-shell.component';

describe('OperatorShellComponent', () => {
  let component: OperatorShellComponent;
  let fixture: ComponentFixture<OperatorShellComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OperatorShellComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(OperatorShellComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
