import { useState } from "react";
import { Music, X, HelpCircle, FileAudio, Upload, CheckCircle } from "lucide-react";

interface AudioUploadTutorialProps {
  onClose: () => void;
}

export const AudioUploadTutorial = ({ onClose }: AudioUploadTutorialProps) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-card border border-border rounded-2xl max-w-md w-full p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-primary/20 rounded-lg">
              <Music className="w-5 h-5 text-primary" />
            </div>
            <h3 className="font-semibold text-lg text-foreground">Profilsong hochladen</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Du kannst einen Song zu deinem Profil hinzufügen, der von Besuchern abgespielt werden kann!
          </p>

          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 bg-secondary/50 rounded-lg">
              <div className="p-1.5 bg-green-500/20 rounded-full mt-0.5">
                <CheckCircle className="w-4 h-4 text-green-500" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">Unterstützte Formate</p>
                <p className="text-xs text-muted-foreground">MP3, WAV, M4A, OGG, AAC</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-secondary/50 rounded-lg">
              <div className="p-1.5 bg-blue-500/20 rounded-full mt-0.5">
                <FileAudio className="w-4 h-4 text-blue-500" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">Maximale Dateigröße</p>
                <p className="text-xs text-muted-foreground">10 MB pro Datei</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-secondary/50 rounded-lg">
              <div className="p-1.5 bg-purple-500/20 rounded-full mt-0.5">
                <Upload className="w-4 h-4 text-purple-500" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">So geht's</p>
                <ol className="text-xs text-muted-foreground space-y-1 mt-1 list-decimal list-inside">
                  <li>Klicke auf "Song ändern"</li>
                  <li>Wähle eine MP3-Datei aus</li>
                  <li>Warte bis der Upload abgeschlossen ist</li>
                  <li>Dein Song erscheint auf deinem Profil!</li>
                </ol>
              </div>
            </div>
          </div>

          <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <HelpCircle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-amber-600 dark:text-amber-400">
                <strong>Tipp:</strong> Wähle einen kurzen Ausschnitt (30-60 Sekunden) deines Lieblingssongs für die beste Wirkung!
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-full py-2.5 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
          >
            Verstanden!
          </button>
        </div>
      </div>
    </div>
  );
};

// Hook to show tutorial on first visit
export const useAudioTutorial = () => {
  const STORAGE_KEY = 'audio_tutorial_shown';
  
  const shouldShowTutorial = (): boolean => {
    return !localStorage.getItem(STORAGE_KEY);
  };

  const markTutorialShown = () => {
    localStorage.setItem(STORAGE_KEY, 'true');
  };

  return { shouldShowTutorial, markTutorialShown };
};
