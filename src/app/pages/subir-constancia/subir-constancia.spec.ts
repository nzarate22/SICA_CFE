import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SubirConstancia } from './subir-constancia';

describe('SubirConstancia', () => {
  let component: SubirConstancia;
  let fixture: ComponentFixture<SubirConstancia>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SubirConstancia]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SubirConstancia);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
