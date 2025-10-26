declare global {
  interface Window {
    showDirectoryPicker(): Promise<FileSystemDirectoryHandle>;
  }
}

import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class FileSystemService {
  private directoryHandle: FileSystemDirectoryHandle | null = null;

  async solicitarPermisos(): Promise<boolean> {
    if (!('showDirectoryPicker' in window)) {
      console.error('❌ File System Access API no soportada en este navegador');
      alert('Esta funcionalidad requiere un navegador compatible como Chrome o Edge, y debe estar en HTTPS o localhost.');
      return false;
    }

    try {
      this.directoryHandle = await window.showDirectoryPicker();
      console.log('✅ Permisos de File System concedidos');
      return true;
    } catch (error) {
      console.error('❌ Usuario denegó permisos:', error);
      return false;
    }
  }

  async guardarArchivo(nombre: string, contenido: string): Promise<void> {
    if (!this.directoryHandle) {
      throw new Error('Primero solicita permisos');
    }

    try {
      const fileHandle = await this.directoryHandle.getFileHandle(nombre, { create: true });
      const writable = await fileHandle.createWritable();
      await writable.write(contenido);
      await writable.close();
      console.log('✅ Archivo guardado:', nombre);
    } catch (error) {
      console.error('❌ Error guardando archivo:', error);
      throw error;
    }
  }

  async leerArchivo(nombre: string): Promise<string> {
    if (!this.directoryHandle) {
      throw new Error('Primero solicita permisos');
    }

    try {
      const fileHandle = await this.directoryHandle.getFileHandle(nombre);
      const file = await fileHandle.getFile();
      return await file.text();
    } catch (error) {
      console.error('❌ Error leyendo archivo:', error);
      throw error;
    }
  }

  async listarArchivos(): Promise<string[]> {
    if (!this.directoryHandle) return [];

    const archivos: string[] = [];
    for await (const [nombre, handle] of this.directoryHandle.entries()) {
      if (handle.kind === 'file') {
        archivos.push(nombre);
      }
    }
    return archivos;
  }
}
