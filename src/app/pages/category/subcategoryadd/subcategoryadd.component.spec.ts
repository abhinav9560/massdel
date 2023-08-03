import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SubcategoryaddComponent } from './subcategoryadd.component';

describe('SubcategoryaddComponent', () => {
  let component: SubcategoryaddComponent;
  let fixture: ComponentFixture<SubcategoryaddComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SubcategoryaddComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SubcategoryaddComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
