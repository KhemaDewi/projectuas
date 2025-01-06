import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PembayaranComponent } from './pembayaran.component';

describe('PembayaranComponent', () => {
  let component: PembayaranComponent;
  let fixture: ComponentFixture<PembayaranComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PembayaranComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PembayaranComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
