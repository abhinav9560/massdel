import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CityaddComponent } from './cityadd.component';

describe('CityaddComponent', () => {
  let component: CityaddComponent;
  let fixture: ComponentFixture<CityaddComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CityaddComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CityaddComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
