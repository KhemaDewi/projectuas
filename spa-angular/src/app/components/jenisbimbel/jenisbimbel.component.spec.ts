import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JenisbimbelComponent } from './jenisbimbel.component';

describe('JenisbimbelComponent', () => {
  let component: JenisbimbelComponent;
  let fixture: ComponentFixture<JenisbimbelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [JenisbimbelComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(JenisbimbelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
