import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GestionCentro } from './gestion-centro';

describe('GestionCentro', () => {
  let component: GestionCentro;
  let fixture: ComponentFixture<GestionCentro>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GestionCentro]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GestionCentro);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
