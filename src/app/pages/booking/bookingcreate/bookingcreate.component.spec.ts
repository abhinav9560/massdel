import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BookingcreateComponent } from './bookingcreate.component';

describe('BookingcreateComponent', () => {
  let component: BookingcreateComponent;
  let fixture: ComponentFixture<BookingcreateComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BookingcreateComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BookingcreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
