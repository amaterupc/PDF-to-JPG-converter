import React, { useState } from 'react';
import { ConvertedPage } from '../types';
import { Button } from './Button';
import { Check, Download, ZoomIn, X, Info } from 'lucide-react';

interface ResultScreenProps {
  pages: ConvertedPage[];
  onTogglePage: (id: string) => void;
  onToggleAll: (select: boolean) => void;
  onDownloadSelected: () => void;
  onDownloadSingle: (page: ConvertedPage) => void;
  onReset: () => void;
}

export const ResultScreen: React.FC<ResultScreenProps> = ({
  pages,
  onTogglePage,
  onToggleAll,
  onDownloadSelected,
  onDownloadSingle,
  onReset,
}) => {
  const [previewPage, setPreviewPage] = useState<ConvertedPage | null>(null);
  
  const selectedCount = pages.filter(p => p.isSelected).length;
  const isAllSelected = pages.length > 0 && selectedCount === pages.length;

  return (
    <div className="pb-20">
      {/* Sticky Action Bar */}
      <div className="sticky top-0 z-20 bg-white border-b border-slate-200 shadow-sm mb-6 -mx-4 px-4 py-4 md:px-8">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-bold text-slate-900">
              {pages.length}枚の画像を生成しました
            </h2>
            <span className="text-sm bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">
              選択中: {selectedCount}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => onToggleAll(!isAllSelected)}
            >
              {isAllSelected ? '選択を解除' : 'すべて選択'}
            </Button>
            
            <Button
              variant="primary"
              size="sm"
              onClick={onDownloadSelected}
              disabled={selectedCount === 0}
              className="flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              選択した画像をダウンロード
            </Button>
            
             <Button
              variant="ghost"
              size="sm"
              onClick={onReset}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              別のファイルを変換
            </Button>
          </div>
        </div>
        
        <div className="max-w-6xl mx-auto mt-2 flex items-start gap-2 text-xs text-amber-600 bg-amber-50 p-2 rounded border border-amber-100">
          <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <p>ブラウザによっては、複数のファイルを連続してダウンロードする際に許可を求められる場合があります。</p>
        </div>
      </div>

      {/* Grid of Pages */}
      <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 px-4">
        {pages.map((page) => (
          <div 
            key={page.id} 
            className={`
              relative group bg-white rounded-xl shadow-sm border-2 overflow-hidden transition-all
              ${page.isSelected ? 'border-blue-500 ring-2 ring-blue-100' : 'border-slate-200 hover:border-blue-300'}
            `}
          >
            {/* Header / Checkbox */}
            <div className="absolute top-0 left-0 right-0 p-3 flex justify-between items-start bg-gradient-to-b from-black/50 to-transparent z-10">
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={page.isSelected}
                  onChange={() => onTogglePage(page.id)}
                  className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                />
              </label>
              <span className="text-white text-xs font-mono bg-black/40 px-1.5 py-0.5 rounded backdrop-blur-sm">
                p{page.pageNum.toString().padStart(2, '0')}
              </span>
            </div>

            {/* Thumbnail */}
            <div 
              className="aspect-[1/1.4] bg-slate-100 cursor-pointer overflow-hidden relative"
              onClick={() => setPreviewPage(page)}
            >
               <img 
                 src={page.blobUrl} 
                 alt={`ページ ${page.pageNum}`}
                 className="w-full h-full object-contain"
               />
               <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                  <ZoomIn className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-lg" />
               </div>
            </div>

            {/* Footer / Individual Action */}
            <div className="p-3 border-t border-slate-100 bg-white flex justify-between items-center">
              <span className="text-xs text-slate-500 truncate max-w-[80px]">
                {page.originalName}_p{page.pageNum}.jpg
              </span>
              <Button
                variant="secondary"
                size="sm"
                className="!px-2 !py-1 h-7 text-xs"
                onClick={() => onDownloadSingle(page)}
                title="このページをダウンロード"
              >
                <Download className="w-3 h-3" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Preview Modal */}
      {previewPage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={() => setPreviewPage(null)}>
          <div className="relative max-w-4xl max-h-[90vh] bg-white rounded-lg shadow-2xl overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b border-slate-100">
               <h3 className="font-semibold text-slate-900">ページ {previewPage.pageNum} のプレビュー</h3>
               <button onClick={() => setPreviewPage(null)} className="text-slate-500 hover:text-slate-900">
                 <X className="w-6 h-6" />
               </button>
            </div>
            <div className="flex-1 overflow-auto p-4 bg-slate-50 flex items-center justify-center">
               <img 
                 src={previewPage.blobUrl} 
                 alt={`フルプレビュー ${previewPage.pageNum}`} 
                 className="max-w-full max-h-[75vh] object-contain shadow-lg" 
               />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};