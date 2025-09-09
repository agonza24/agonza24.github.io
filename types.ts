
export enum AppStatus {
  IDLE = 'Idle',
  LISTENING = 'Listening...',
  PROCESSING = 'Translating...',
  SPEAKING = 'Speaking...',
}

export interface TranslationLog {
  spanish: string;
  german: string;
  timestamp: string;
}
