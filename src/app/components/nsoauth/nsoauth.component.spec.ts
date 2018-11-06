import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NsoauthComponent } from './nsoauth.component';

describe('NsoauthComponent', () => {
  let component: NsoauthComponent;
  let fixture: ComponentFixture<NsoauthComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NsoauthComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NsoauthComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
