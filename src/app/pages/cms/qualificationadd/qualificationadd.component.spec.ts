import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { QualificationaddComponent } from './qualificationadd.component';

describe('QualificationaddComponent', () => {
  let component: QualificationaddComponent;
  let fixture: ComponentFixture<QualificationaddComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ QualificationaddComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(QualificationaddComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
