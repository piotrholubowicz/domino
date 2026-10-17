import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CommonModule } from '@angular/common';

import { PieceComponent } from './piece.component';

describe('PieceComponent', () => {
  let component: PieceComponent;
  let fixture: ComponentFixture<PieceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CommonModule],
      declarations: [PieceComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PieceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
