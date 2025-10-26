import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { P2pService } from '../../../services/p2p.service';
import { RxTodoDocument } from '../../../services/database.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-todo-p2p',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './todo-p2p.component.html',
  styleUrl: './todo-p2p.component.css'
})
export class TodoP2pComponent implements OnInit, OnDestroy {
  todos: RxTodoDocument[] = [];
  newTodo = '';
  copyUrl = '';
  allCompleted = false;
  remainingCount = 0;
  completedCount = 0;
  private subscription: Subscription = new Subscription();

  constructor(private p2pService: P2pService) {}

  ngOnInit() {
    console.log('TodoP2pComponent initialized');
    this.subscription.add(
      this.p2pService.todos$.subscribe(todos => {
        console.log('Component received todos update:', todos.length, 'items');
        this.todos = todos;
        this.updateCounts();
      })
    );

    this.subscription.add(
      this.p2pService.copyUrl$.subscribe(url => {
        this.copyUrl = url;
      })
    );
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  private updateCounts() {
    this.remainingCount = this.p2pService.getRemainingCount();
    this.completedCount = this.p2pService.getCompletedCount();
    this.allCompleted = this.p2pService.getAllCompleted();
  }

  async addTodo() {
    console.log('Component addTodo called with:', this.newTodo);
    if (this.newTodo.trim()) {
      await this.p2pService.addTodo(this.newTodo.trim());
      this.newTodo = '';
      console.log('Component addTodo completed');
    }
  }

  async toggleTodo(todo: RxTodoDocument) {
    await this.p2pService.toggleTodo(todo);
  }

  async toggleAll() {
    await this.p2pService.toggleAll();
  }

  async updateTodoName(todo: RxTodoDocument, event: Event) {
    const target = event.target as HTMLElement;
    const newName = target.innerText || target.textContent || '';
    await this.p2pService.updateTodoName(todo, newName);
  }

  async deleteTodo(todo: RxTodoDocument) {
    await this.p2pService.deleteTodo(todo);
  }

  async clearCompleted() {
    await this.p2pService.clearCompleted();
  }

  escapeForHTML(s: string): string {
    return this.p2pService.escapeForHTML(s);
  }
}
