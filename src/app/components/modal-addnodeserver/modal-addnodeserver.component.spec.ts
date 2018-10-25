import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalAddnodeserverComponent } from './modal-addnodeserver.component';

describe('ModalAddnodeserverComponent', () => {
  let component: ModalAddnodeserverComponent;
  let fixture: ComponentFixture<ModalAddnodeserverComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ModalAddnodeserverComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalAddnodeserverComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
