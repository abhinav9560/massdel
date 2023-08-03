import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FaqaddComponent } from './faqadd.component';

describe('FaqaddComponent', () => {
  let component: FaqaddComponent;
  let fixture: ComponentFixture<FaqaddComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FaqaddComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FaqaddComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
