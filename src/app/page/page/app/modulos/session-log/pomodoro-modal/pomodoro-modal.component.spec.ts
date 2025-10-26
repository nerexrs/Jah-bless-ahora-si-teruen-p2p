import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PomodoroModalComponent } from './pomodoro-modal.component';

describe('PomodoroModalComponent', () => {
  let component: PomodoroModalComponent;
  let fixture: ComponentFixture<PomodoroModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PomodoroModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PomodoroModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
