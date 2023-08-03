import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GlobalsettingComponent } from './globalsetting.component';

describe('GlobalsettingComponent', () => {
  let component: GlobalsettingComponent;
  let fixture: ComponentFixture<GlobalsettingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GlobalsettingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GlobalsettingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
