export enum AppStatus {
  IDLE = 'IDLE',
  PROCESSING = 'PROCESSING',
  RESULT = 'RESULT',
  ERROR = 'ERROR',
}

export interface ConvertedPage {
  id: string; // Unique ID for React keys
  pageNum: number; // 1-based index
  blobUrl: string; // URL to the generated blob
  originalName: string; // Base filename
  isSelected: boolean;
  width: number;
  height: number;
}

export interface ProcessingState {
  current: number;
  total: number;
}

export interface AppError {
  title: string;
  message: string;
}

export const MAX_PAGES = 20;
export const DPI_SCALE = 150 / 72; // ~2.0833