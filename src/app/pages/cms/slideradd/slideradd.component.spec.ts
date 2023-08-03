import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SlideraddComponent } from './slideradd.component';

describe('SlideraddComponent', () => {
  let component: SlideraddComponent;
  let fixture: ComponentFixture<SlideraddComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SlideraddComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SlideraddComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
