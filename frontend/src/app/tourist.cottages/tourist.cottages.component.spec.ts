import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TouristCottagesComponent } from './tourist.cottages.component';

describe('TouristCottagesComponent', () => {
  let component: TouristCottagesComponent;
  let fixture: ComponentFixture<TouristCottagesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TouristCottagesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TouristCottagesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
