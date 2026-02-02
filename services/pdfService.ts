import * as pdfjs from 'pdfjs-dist';
import { DPI_SCALE } from '../types';

// package.json の pdfjs-dist バージョンと一致させてください
const PDFJS_VERSION = '4.10.38';
pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${PDFJS_VERSION}/build/pdf.worker.min.mjs`;

export class PdfService {
  private pdfDocument: any = null;

  async loadDocument(file: File): Promise<number> {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const loadingTask = pdfjs.getDocument({
        data: arrayBuffer,
        password: '', 
      });

      this.pdfDocument = await loadingTask.promise;
      return this.pdfDocument.numPages;
    } catch (error: any) {
      if (error.name === 'PasswordException') {
        throw new Error('PASSWORD_PROTECTED');
      }
      if (error.name === 'InvalidPDFException') {
        throw new Error('INVALID_PDF');
      }
      console.error('PDF load error:', error);
      throw new Error('LOAD_FAILED');
    }
  }

  async renderPageAsJpg(pageNum: number): Promise<{ blobUrl: string; width: number; height: number }> {
    if (!this.pdfDocument) {
      throw new Error('Document not loaded');
    }

    const page = await this.pdfDocument.getPage(pageNum);
    const viewport = page.getViewport({ scale: DPI_SCALE });

    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d', { alpha: false });
    
    if (!context) {
      throw new Error('Canvas context unavailable');
    }

    canvas.width = viewport.width;
    canvas.height = viewport.height;

    const renderContext = {
      canvasContext: context,
      viewport: viewport,
    };

    await page.render(renderContext).promise;

    return new Promise((resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (blob) {
            const blobUrl = URL.createObjectURL(blob);
            resolve({ 
              blobUrl, 
              width: viewport.width, 
              height: viewport.height 
            });
          } else {
            reject(new Error('Canvas to Blob conversion failed'));
          }
        },
        'image/jpeg',
        0.85
      );
    });
  }

  destroy() {
    if (this.pdfDocument) {
      this.pdfDocument.destroy();
      this.pdfDocument = null;
    }
  }
}

export const pdfService = new PdfService();