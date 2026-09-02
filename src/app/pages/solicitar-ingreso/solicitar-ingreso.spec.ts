import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SolicitarIngreso } from './solicitar-ingreso';

describe('SolicitarIngreso', () => {
  let component: SolicitarIngreso;
  let fixture: ComponentFixture<SolicitarIngreso>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SolicitarIngreso]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SolicitarIngreso);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
