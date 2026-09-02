import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UsuariosFirmas } from './usuarios-firmas';

describe('UsuariosFirmas', () => {
  let component: UsuariosFirmas;
  let fixture: ComponentFixture<UsuariosFirmas>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UsuariosFirmas]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UsuariosFirmas);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
