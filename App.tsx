// Fix: Add type definitions for Web Speech API to handle missing types in default TypeScript lib.
interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onend: (() => void) | null;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  start(): void;
  stop(): void;
}

interface SpeechRecognitionEvent extends Event {
  readonly results: SpeechRecognitionResultList;
}

interface SpeechRecognitionResultList {
  readonly length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  readonly isFinal: boolean;
  readonly length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
  readonly transcript: string;
}

interface SpeechRecognitionErrorEvent extends Event {
  readonly error: string;
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition;
    webkitSpeechRecognition: new () => SpeechRecognition;
  }
}

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { AppStatus, TranslationLog } from './types.ts';
import { translateText } from './services/geminiService.ts';
import { ControlButtons } from './components/ControlButtons.tsx';
import { StatusIndicator } from './components/StatusIndicator.tsx';
import { LogDisplay } from './components/LogDisplay.tsx';

const App: React.FC = () => {
  const [status, setStatus] = useState<AppStatus>(AppStatus.IDLE);
  const [log, setLog] = useState<TranslationLog[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const processTranscription = useCallback(async (text: string) => {
    if (!text.trim()) {
      setStatus(AppStatus.LISTENING);
      return;
    }

    setStatus(AppStatus.PROCESSING);
    setError(null);

    try {
      const germanTranslation = await translateText(text);
      
      const newLog: TranslationLog = {
        spanish: text,
        german: germanTranslation,
        timestamp: new Date().toISOString(),
      };
      setLog(prevLog => [newLog, ...prevLog]);

      setStatus(AppStatus.SPEAKING);
      const utterance = new SpeechSynthesisUtterance(germanTranslation);
      utterance.lang = 'de-DE';
      utterance.onend = () => {
        if (recognitionRef.current) {
          setStatus(AppStatus.LISTENING);
        }
      };
      utteranceRef.current = utterance;
      window.speechSynthesis.speak(utterance);

    } catch (err) {
      console.error('Translation or Synthesis Error:', err);
      setError('Sorry, something went wrong. Please try again.');
      setStatus(AppStatus.IDLE);
    }
  }, []);

  const stopAllProcesses = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.onresult = null;
      recognitionRef.current.onend = null;
      recognitionRef.current.onerror = null;
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    if (utteranceRef.current) {
        window.speechSynthesis.cancel();
        utteranceRef.current = null;
    }
    setStatus(AppStatus.IDLE);
  }, []);


  const startListening = useCallback(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setError('Speech recognition is not supported in this browser.');
      return;
    }
    
    stopAllProcesses();
    setError(null);
    setStatus(AppStatus.LISTENING);

    const recognition = new SpeechRecognition();
    recognition.lang = 'es-ES';
    recognition.interimResults = false;
    recognition.continuous = false; 
    
    recognitionRef.current = recognition;

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      processTranscription(transcript);
    };

    recognition.onerror = (event) => {
      if (event.error !== 'no-speech' && event.error !== 'aborted') {
          console.error('Speech Recognition Error:', event.error);
          setError(`Speech recognition error: ${event.error}`);
          stopAllProcesses();
      }
    };
    
    recognition.onend = () => {
      // Automatically restart if we are supposed to be listening
      if (status === AppStatus.LISTENING && recognitionRef.current) {
        recognition.start();
      }
    };
    
    recognition.start();

  }, [processTranscription, status, stopAllProcesses]);


  const handleStart = useCallback(() => {
    startListening();
  }, [startListening]);

  const handleStop = useCallback(() => {
    stopAllProcesses();
  }, [stopAllProcesses]);

  useEffect(() => {
    return () => {
        stopAllProcesses();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center p-4 sm:p-6 lg:p-8 font-sans">
      <div className="w-full max-w-4xl mx-auto">
        <header className="text-center mb-6">
          <h1 className="text-4xl sm:text-5xl font-bold text-cyan-400">Real-Time Voice Translator</h1>
          <p className="text-lg text-gray-400 mt-2">Spanish <span className="font-bold mx-2">&rarr;</span> German</p>
        </header>

        <main className="bg-gray-800 shadow-2xl rounded-lg p-6 space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <StatusIndicator status={status} />
            <ControlButtons
              isListening={status !== AppStatus.IDLE}
              onStart={handleStart}
              onStop={handleStop}
            />
          </div>
          
          {error && <div className="bg-red-900/50 border border-red-500 text-red-300 p-3 rounded-md text-center">{error}</div>}

          <LogDisplay log={log} />
        </main>

        <footer className="text-center text-gray-500 mt-8">
          <p>Powered by Gemini API and the Web Speech API.</p>
        </footer>
      </div>
    </div>
  );
};

export default App;