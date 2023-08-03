import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TrainingaddComponent } from './trainingadd.component';

describe('TrainingaddComponent', () => {
  let component: TrainingaddComponent;
  let fixture: ComponentFixture<TrainingaddComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TrainingaddComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TrainingaddComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
