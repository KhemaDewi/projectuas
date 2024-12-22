import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MuridComponent } from './murid.component';

describe('MuridComponent', () => {
  let component: MuridComponent;
  let fixture: ComponentFixture<MuridComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MuridComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MuridComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
