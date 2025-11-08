import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TouristCottagesDetailsComponent } from './tourist.cottages.details.component';

describe('TouristCottagesDetailsComponent', () => {
  let component: TouristCottagesDetailsComponent;
  let fixture: ComponentFixture<TouristCottagesDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TouristCottagesDetailsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TouristCottagesDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
