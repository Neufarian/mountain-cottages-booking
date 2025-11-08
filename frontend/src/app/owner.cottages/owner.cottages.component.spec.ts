import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OwnerCottagesComponent } from './owner.cottages.component';

describe('OwnerCottagesComponent', () => {
  let component: OwnerCottagesComponent;
  let fixture: ComponentFixture<OwnerCottagesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OwnerCottagesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OwnerCottagesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
