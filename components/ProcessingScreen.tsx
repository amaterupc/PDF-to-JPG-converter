import React from 'react';
import { ProgressBar } from './ProgressBar';
import { Button } from './Button';
import { ProcessingState } from '../types';
import { XCircle } from 'lucide-react';

interface ProcessingScreenProps {
  progress: ProcessingState;
  onCancel: () => void;
}

export const ProcessingScreen: React.FC<ProcessingScreenProps> = ({ progress, onCancel }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] max-w-md mx-auto p-6">
      <div className="w-full bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
        <h2 className="text-xl font-semibold text-center mb-6 text-slate-900">PDFを変換しています...</h2>
        
        <ProgressBar current={progress.current} total={progress.total} />
        
        <p className="text-center text-sm text-slate-500 mt-4 mb-8">
          {progress.total}ページ中 {progress.current}ページ目を処理しています。<br/>
          お使いの端末の性能により、数分かかる場合があります。
        </p>

        <Button 
          variant="secondary" 
          fullWidth 
          onClick={onCancel}
          className="flex items-center justify-center gap-2"
        >
          <XCircle className="w-4 h-4" />
          処理を中止する
        </Button>
      </div>
    </div>
  );
};