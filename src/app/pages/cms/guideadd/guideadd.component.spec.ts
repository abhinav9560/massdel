import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GuideaddComponent } from './guideadd.component';

describe('GuideaddComponent', () => {
  let component: GuideaddComponent;
  let fixture: ComponentFixture<GuideaddComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GuideaddComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GuideaddComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
