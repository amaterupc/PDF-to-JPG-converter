import React, { useRef, useState } from 'react';
import { Upload, FileText, AlertCircle } from 'lucide-react';
import { Button } from './Button';
import { MAX_PAGES } from '../types';

interface UploadScreenProps {
  onFileSelect: (file: File) => void;
}

export const UploadScreen: React.FC<UploadScreenProps> = ({ onFileSelect }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragError, setDragError] = useState<string | null>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    setDragError(null);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      validateAndUpload(files[0]);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      validateAndUpload(e.target.files[0]);
    }
  };

  const validateAndUpload = (file: File) => {
    if (file.type !== 'application/pdf') {
      setDragError('有効なPDFファイルをアップロードしてください。');
      return;
    }
    onFileSelect(file);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-4">
      <div className="text-center mb-8">
        <div className="bg-blue-100 p-4 rounded-full inline-block mb-4">
          <FileText className="w-10 h-10 text-blue-600" />
        </div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">PDFからJPGへ変換</h1>
        <p className="text-slate-600 max-w-md mx-auto">
          安全なブラウザ完結型の変換ツールです。最大{MAX_PAGES}ページまで、サーバーにアップロードすることなく即座に処理します。
        </p>
      </div>

      <div
        className={`
          w-full max-w-xl p-10 border-2 border-dashed rounded-2xl transition-all
          flex flex-col items-center justify-center cursor-pointer bg-white
          ${isDragging 
            ? 'border-blue-500 bg-blue-50 shadow-lg' 
            : 'border-slate-300 hover:border-blue-400 hover:bg-slate-50'
          }
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
      >
        <input
          type="file"
          ref={inputRef}
          className="hidden"
          accept=".pdf"
          onChange={handleInputChange}
        />
        
        <Upload className={`w-12 h-12 mb-4 ${isDragging ? 'text-blue-600' : 'text-slate-400'}`} />
        
        <p className="text-lg font-medium text-slate-900 mb-2">
          クリックしてファイルを選択、またはドラッグ＆ドロップ
        </p>
        <p className="text-sm text-slate-500 mb-6">
          PDFファイルのみ対応 • 最大{MAX_PAGES}ページ
        </p>

        <Button variant="primary">PDFを選択する</Button>

        {dragError && (
          <div className="mt-4 flex items-center text-red-600 text-sm animate-pulse">
            <AlertCircle className="w-4 h-4 mr-2" />
            {dragError}
          </div>
        )}
      </div>

      <div className="mt-8 text-sm text-slate-400 text-center max-w-lg">
        <p className="mb-1">プライバシーについて: ファイルの処理はすべてお使いのブラウザ内で行われ、外部に送信されることはありません。</p>
        <p>パスワード保護されたPDFには対応していません。</p>
      </div>
    </div>
  );
};