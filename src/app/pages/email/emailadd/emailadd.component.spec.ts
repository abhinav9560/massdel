import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EmailaddComponent } from './emailadd.component';

describe('EmailaddComponent', () => {
  let component: EmailaddComponent;
  let fixture: ComponentFixture<EmailaddComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EmailaddComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EmailaddComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
