import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class OpfsService {
  textInput: string = '';
  message: string = '';

  constructor() { }

  async processText(text: string): Promise<string> {
    try {
      const root = await navigator.storage.getDirectory();
      const fileHandle = await root.getFileHandle('jah_bless.txt', { create: true });
      const writable = await fileHandle.createWritable();
      await writable.write(text);
      await writable.close();
      this.message = 'Jah Bless: Texto guardado en OPFS - ' + text;
      return this.message;
    } catch (error) {
      console.error('Error guardando en OPFS:', error);
      this.message = 'Error: No se pudo guardar el texto';
      return this.message;
    }
  }

  async readText(): Promise<string> {
    try {
      const root = await navigator.storage.getDirectory();
      const fileHandle = await root.getFileHandle('jah_bless.txt');
      const file = await fileHandle.getFile();
      const contents = await file.text();
      return contents;
    } catch (error) {
      console.error('Error leyendo de OPFS:', error);
      return 'Error: No se pudo leer el archivo';
    }
  }

  /**
   * Lista los nombres de todos los archivos en el directorio raíz del OPFS.
   * @returns Un array con los nombres de los archivos.
   */
  async listarArchivos(): Promise<string[]> {
    try {
      const root = await navigator.storage.getDirectory();
      const files: string[] = [];
      for await (const entry of root.values()) {
        if (entry.kind === 'file') {
          files.push(entry.name);
        }
      }
      return files;
    } catch (error) {
      console.error('Error listando archivos de OPFS:', error);
      throw new Error('No se pudieron listar los archivos de OPFS.');
    }
  }
}
