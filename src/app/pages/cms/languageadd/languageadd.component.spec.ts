import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LanguageaddComponent } from './languageadd.component';

describe('LanguageaddComponent', () => {
  let component: LanguageaddComponent;
  let fixture: ComponentFixture<LanguageaddComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LanguageaddComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LanguageaddComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
