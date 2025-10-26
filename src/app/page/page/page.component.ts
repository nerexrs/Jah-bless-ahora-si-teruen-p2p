import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { OpfsService } from '../../services/opfs/opfs.service';
import { FileSystemService } from '../../services/file-system.service';
import { TodoP2pComponent } from './todo-p2p/todo-p2p.component';
import { P2pService } from '../../services/p2p.service';
// Importar módulos del proyecto Pomodoro
import { ClockModule } from './app/modulos/clock/clock.module';
import { SessionLogModule } from './app/modulos/session-log/session-log.module';
import { FloatingButtonModule } from './app/floating-button/floating-button.module';
import { SettingsFloatingButtonModule } from './app/modulos/settings-floating-button/settings-floating-button.module';

@Component({
  selector: 'app-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    TodoP2pComponent,
    ClockModule,
    SessionLogModule,
    FloatingButtonModule,
    SettingsFloatingButtonModule
  ],
  templateUrl: './page.component.html',
  styleUrl: './page.component.css'
})
export class PageComponent {
  textInput: string = '';
  message: string = '';
  readMessage: string = '';
  fileSystemActivated: boolean = false;
  fileCounter: number = 1;
  archivosList: string[] = [];
  selectedFileContent: string = '';


  constructor(
    private opfsService: OpfsService,
    private fileSystem: FileSystemService,
    private p2pService: P2pService
  ) {
    // Integrar servicios del proyecto Pomodoro con P2P
    // Los servicios ClockService y SessionLogService ya están disponibles globalmente
  }


  async onButtonClick() {
    this.message = await this.opfsService.processText(this.textInput);
  }

  async onReadClick() {
    this.readMessage = await this.opfsService.readText();
  }

  async activarFS() {
    if (this.fileSystemActivated) {
      alert('File System ya está activado');
      return;
    }

    const permisos = await this.fileSystem.solicitarPermisos();
    if (permisos) {
      this.fileSystemActivated = true;
      console.log('File System activado');
      alert('File System activado correctamente');
    }
  }

  async guardarEjemplo() {
    if (!this.fileSystemActivated) {
      alert('Primero activa el File System');
      return;
    }

    const nombreArchivo = `texto${this.fileCounter}.txt`;

    await this.fileSystem.guardarArchivo(nombreArchivo, this.textInput || 'Jah Bless');
    alert(`Archivo ${nombreArchivo} guardado`);
    this.fileCounter++;
  }


  async listarFiles() {
    this.archivosList = await this.fileSystem.listarArchivos();
    console.log('Archivos:', this.archivosList);
  }

  async leerArchivoFS(nombreArchivo: string) {
    if (!this.fileSystemActivated) {
      alert('File System no está activado');
      return;
    }

    try {
      this.selectedFileContent = await this.fileSystem.leerArchivo(nombreArchivo);
    } catch (error) {
      console.error('Error leyendo archivo:', error);
      alert('Error al leer el archivo');
    }
  }

}
