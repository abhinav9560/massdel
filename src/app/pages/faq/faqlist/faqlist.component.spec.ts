import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FaqlistComponent } from './faqlist.component';

describe('FaqlistComponent', () => {
  let component: FaqlistComponent;
  let fixture: ComponentFixture<FaqlistComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FaqlistComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FaqlistComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
