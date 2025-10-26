import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TodoP2pComponent } from './todo-p2p.component';
import { P2pService } from '../../../services/p2p.service';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    TodoP2pComponent
  ],
  providers: [
    P2pService
  ]
})
export class TodoP2pModule { }
