import React, { useState, useEffect, useRef } from 'react';
import { UploadScreen } from './components/UploadScreen';
import { ProcessingScreen } from './components/ProcessingScreen';
import { ResultScreen } from './components/ResultScreen';
import { Button } from './components/Button';
import { AlertTriangle, Github } from 'lucide-react';
import { AppStatus, ConvertedPage, ProcessingState, AppError, MAX_PAGES } from './types';
import { pdfService } from './services/pdfService';

function App() {
  // State
  const [status, setStatus] = useState<AppStatus>(AppStatus.IDLE);
  const [processing, setProcessing] = useState<ProcessingState>({ current: 0, total: 0 });
  const [pages, setPages] = useState<ConvertedPage[]>([]);
  const [error, setError] = useState<AppError | null>(null);
  const [baseFilename, setBaseFilename] = useState<string>('converted');
  
  // Refs for cancellation
  const abortControllerRef = useRef<AbortController | null>(null);

  // Helper to safely reset state
  const resetApp = () => {
    // Revoke old URLs to prevent memory leaks
    pages.forEach(p => URL.revokeObjectURL(p.blobUrl));
    
    setStatus(AppStatus.IDLE);
    setPages([]);
    setError(null);
    setProcessing({ current: 0, total: 0 });
    setBaseFilename('converted');
    pdfService.destroy();
  };

  const handleFileSelect = async (file: File) => {
    resetApp();
    setError(null);

    // Set base filename
    const name = file.name.replace(/\.pdf$/i, '') || 'converted';
    setBaseFilename(name);

    try {
      setStatus(AppStatus.PROCESSING);
      const totalPages = await pdfService.loadDocument(file);

      if (totalPages > MAX_PAGES) {
        throw new Error('TOO_MANY_PAGES');
      }

      if (totalPages === 0) {
        throw new Error('EMPTY_PDF');
      }

      setProcessing({ current: 0, total: totalPages });
      processPages(totalPages, name);

    } catch (err: any) {
      handleError(err);
    }
  };

  const processPages = async (total: number, baseName: string) => {
    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;

    const newPages: ConvertedPage[] = [];

    try {
      for (let i = 1; i <= total; i++) {
        if (signal.aborted) {
          resetApp();
          return;
        }

        setProcessing(prev => ({ ...prev, current: i }));

        // Small delay to allow UI to update (React specific in tight loops)
        await new Promise(r => setTimeout(r, 10));

        const result = await pdfService.renderPageAsJpg(i);

        const page: ConvertedPage = {
          id: `page-${i}-${Date.now()}`,
          pageNum: i,
          blobUrl: result.blobUrl,
          width: result.width,
          height: result.height,
          originalName: baseName,
          isSelected: true 
        };

        newPages.push(page);
      }

      if (!signal.aborted) {
        setPages(newPages);
        setStatus(AppStatus.RESULT);
      }
    } catch (err) {
      if (!signal.aborted) {
        handleError(err);
      }
    }
  };

  const handleCancel = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    resetApp();
  };

  const handleError = (err: any) => {
    setStatus(AppStatus.ERROR);
    let title = 'エラー';
    let message = '予期しないエラーが発生しました。';

    if (err.message === 'TOO_MANY_PAGES') {
      title = 'ファイルサイズ制限';
      message = `このPDFは${MAX_PAGES}ページの制限を超えています。ファイルを分割するか、より小さいファイルを選択してください。`;
    } else if (err.message === 'PASSWORD_PROTECTED') {
      title = '暗号化されたPDF';
      message = 'パスワード保護されたPDFには対応していません。';
    } else if (err.message === 'INVALID_PDF') {
      title = '無効なファイル';
      message = 'ファイルを読み込めませんでした。ファイルが破損しているか、有効なPDFではない可能性があります。';
    }

    setError({ title, message });
    pdfService.destroy();
  };

  // --- Result Screen Actions ---

  const togglePage = (id: string) => {
    setPages(prev => prev.map(p => p.id === id ? { ...p, isSelected: !p.isSelected } : p));
  };

  const toggleAll = (select: boolean) => {
    setPages(prev => prev.map(p => ({ ...p, isSelected: select })));
  };

  const downloadFile = (url: string, filename: string) => {
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const downloadSingle = (page: ConvertedPage) => {
    const num = page.pageNum.toString().padStart(2, '0');
    downloadFile(page.blobUrl, `${baseFilename}_p${num}.jpg`);
  };

  const downloadSelected = async () => {
    const selected = pages.filter(p => p.isSelected).sort((a, b) => a.pageNum - b.pageNum);
    
    for (const page of selected) {
        downloadSingle(page);
        await new Promise(resolve => setTimeout(resolve, 500));
    }
  };

  useEffect(() => {
    return () => {
      pages.forEach(p => URL.revokeObjectURL(p.blobUrl));
      pdfService.destroy();
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col font-sans">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 py-4">
        <div className="container mx-auto px-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-lg">
              JPG
            </div>
            <span className="text-xl font-bold text-slate-800">PDF JPG変換</span>
          </div>
          <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="text-slate-500 hover:text-slate-900 transition-colors">
            <Github className="w-6 h-6" />
          </a>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow bg-slate-50">
        <div className="container mx-auto px-4 py-8">
          
          {/* Error Banner */}
          {status === AppStatus.ERROR && error && (
            <div className="max-w-xl mx-auto mb-8 bg-red-50 border-l-4 border-red-500 p-4 rounded-r shadow-sm flex items-start">
              <AlertTriangle className="w-6 h-6 text-red-500 mr-4 flex-shrink-0" />
              <div className="flex-1">
                <h3 className="font-bold text-red-800">{error.title}</h3>
                <p className="text-red-700 mt-1">{error.message}</p>
                <div className="mt-4">
                    <Button variant="danger" size="sm" onClick={resetApp}>別のファイルを試す</Button>
                </div>
              </div>
            </div>
          )}

          {status === AppStatus.IDLE && (
            <UploadScreen onFileSelect={handleFileSelect} />
          )}

          {status === AppStatus.PROCESSING && (
            <ProcessingScreen progress={processing} onCancel={handleCancel} />
          )}

          {status === AppStatus.RESULT && (
            <ResultScreen 
              pages={pages}
              onTogglePage={togglePage}
              onToggleAll={toggleAll}
              onDownloadSelected={downloadSelected}
              onDownloadSingle={downloadSingle}
              onReset={resetApp}
            />
          )}

        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 text-center text-sm text-slate-500">
        <p>© 2026 PDF JPG変換. ブラウザ上でのみ処理されます。</p>
      </footer>
    </div>
  );
}

export default App;