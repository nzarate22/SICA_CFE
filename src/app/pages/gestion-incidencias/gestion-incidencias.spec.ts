import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GestionIncidencias } from './gestion-incidencias';

describe('GestionIncidencias', () => {
  let component: GestionIncidencias;
  let fixture: ComponentFixture<GestionIncidencias>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GestionIncidencias]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GestionIncidencias);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
