import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TandcaddComponent } from './tandcadd.component';

describe('TandcaddComponent', () => {
  let component: TandcaddComponent;
  let fixture: ComponentFixture<TandcaddComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TandcaddComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TandcaddComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
