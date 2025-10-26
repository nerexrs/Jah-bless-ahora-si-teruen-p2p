import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TodoP2pComponent } from './todo-p2p.component';

describe('TodoP2pComponent', () => {
  let component: TodoP2pComponent;
  let fixture: ComponentFixture<TodoP2pComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TodoP2pComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TodoP2pComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
