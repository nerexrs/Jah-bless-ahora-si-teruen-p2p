import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import {
    ensureNotFalsy,
    randomToken
} from 'rxdb/plugins/core';
import {
    RxTodoDocument,
    databasePromise
} from './database.service';

@Injectable({
    providedIn: 'root'
})
export class P2pService {
    private database: any;
    private initPromise: Promise<void>;
    private todosSubject = new BehaviorSubject<RxTodoDocument[]>([]);
    private copyUrlSubject = new BehaviorSubject<string>('');

    todos$ = this.todosSubject.asObservable();
    copyUrl$ = this.copyUrlSubject.asObservable();

    constructor() {
        this.initPromise = this.init();
    }

    private async init() {
        this.database = await databasePromise;

        // update copy url
        this.copyUrlSubject.next(window.location.href);

        // subscribe to todos changes
        this.database.todos.find({
            sort: [
                { state: 'desc' },
                { lastChange: 'desc' }
            ]
        }).$.subscribe((todos: RxTodoDocument[]) => {
            this.todosSubject.next(todos);
        });
    }

    async addTodo(name: string) {
        await this.initPromise;
        if (name.length < 1) { return; }
        await this.database.todos.insert({
            id: randomToken(10),
            name,
            state: 'open',
            lastChange: Date.now()
        });
    }

    async toggleTodo(todo: RxTodoDocument) {
        await this.initPromise;
        await todo.incrementalPatch({ state: todo.state === 'done' ? 'open' : 'done' });
    }

    async toggleAll() {
        await this.initPromise;
        const todos = this.todosSubject.value;
        const allCompleted = this.getAllCompleted();
        const newState = allCompleted ? 'open' : 'done';
        await Promise.all(todos.map(todo => todo.incrementalPatch({ state: newState })));
    }

    async updateTodoName(todo: RxTodoDocument, newName: string) {
        await this.initPromise;
        newName = newName.replace(/<br>/g, '').replace(/\&nbsp;/g, ' ').trim();
        if (newName !== todo.name) {
            await todo.incrementalPatch({ name: newName });
        }
    }

    async deleteTodo(todo: RxTodoDocument) {
        await this.initPromise;
        await todo.remove();
    }

    async clearCompleted() {
        await this.initPromise;
        await this.database.todos.find({ selector: { state: 'done' } }).remove();
    }

    getRemainingCount(): number {
        return this.todosSubject.value.filter(todo => todo.state === 'open').length;
    }

    getCompletedCount(): number {
        return this.todosSubject.value.filter(todo => todo.state === 'done').length;
    }

    getAllCompleted(): boolean {
        const todos = this.todosSubject.value;
        return todos.length > 0 && todos.every(todo => todo.state === 'done');
    }

    escapeForHTML(s: string): string {
        return s.replace(/[&<]/g, c => c === '&' ? '&' : '<');
    }
}
