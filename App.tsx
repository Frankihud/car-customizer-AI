import React, { useState } from 'react';
import Editor from './components/Editor';
import Header from './components/Header';
import { UploadIcon } from './components/icons';
import type { CarView } from './types';

const App: React.FC = () => {
  const [carViews, setCarViews] = useState<CarView[]>([]);

  const handleStart = (views: CarView[]) => {
    setCarViews(views);
  };
  
  const handleReset = () => {
    setCarViews([]);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 font-sans">
      <Header onReset={handleReset} showReset={carViews.length > 0} />
      <main className="container mx-auto px-4 py-8">
        {carViews.length === 0 ? (
          <LandingPage onStart={handleStart} />
        ) : (
          <Editor initialViews={carViews} />
        )}
      </main>
    </div>
  );
};

interface LandingPageProps {
  onStart: (views: CarView[]) => void;
}

const VIEW_TYPES = [
  { id: 'front', label: 'Front View' },
  { id: 'side', label: 'Side View' },
  { id: 'rear', label: 'Rear View' },
];

const LandingPage: React.FC<LandingPageProps> = ({ onStart }) => {
  const [selectedFiles, setSelectedFiles] = useState<{ [key: string]: File }>({});

  const handleFileChange = (id: string, event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedFiles(prev => ({
        ...prev,
        [id]: event.target.files![0]
      }));
    }
  };

  const handleStartClick = () => {
    const views: CarView[] = Object.entries(selectedFiles).map(([id, file]) => {
      const viewType = VIEW_TYPES.find(v => v.id === id);
      return {
        id,
        label: viewType?.label || 'Unknown View',
        file: file as File
      };
    });
    
    // Sort based on VIEW_TYPES order
    views.sort((a, b) => {
        const indexA = VIEW_TYPES.findIndex(v => v.id === a.id);
        const indexB = VIEW_TYPES.findIndex(v => v.id === b.id);
        return indexA - indexB;
    });

    if (views.length > 0) {
      onStart(views);
    }
  };

  const hasFiles = Object.keys(selectedFiles).length > 0;

  return (
    <div className="flex flex-col items-center justify-center text-center min-h-[calc(100vh-200px)]">
      <h1 className="text-4xl md:text-6xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500 mb-4">
        Welcome to CarCustomizerAI
      </h1>
      <p className="text-lg md:text-xl text-gray-400 max-w-2xl mb-10">
        Upload photos of your car to visualize custom modifications. <br/>
        <span className="text-blue-400 font-semibold">Add Front, Side, and Rear views</span> for the best experience.
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl mb-10">
        {VIEW_TYPES.map((view) => (
          <div key={view.id} className="flex flex-col items-center">
            <label
              htmlFor={`upload-${view.id}`}
              className={`cursor-pointer group relative flex flex-col justify-center items-center w-full aspect-[4/3] bg-gray-800 border-2 border-dashed rounded-xl transition-all duration-300 overflow-hidden
                ${selectedFiles[view.id] 
                  ? 'border-blue-500' 
                  : 'border-gray-600 hover:border-blue-400 hover:bg-gray-700'}`}
            >
              {selectedFiles[view.id] ? (
                <>
                  <img 
                    src={URL.createObjectURL(selectedFiles[view.id])} 
                    alt={view.label} 
                    className="absolute inset-0 w-full h-full object-contain p-2 opacity-80 group-hover:opacity-100 transition-opacity" 
                  />
                  <div className="z-10 bg-black/50 p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity absolute">
                     <UploadIcon className="w-6 h-6 text-white" />
                  </div>
                  <div className="absolute bottom-2 left-0 right-0 text-center z-10">
                     <span className="text-xs font-bold bg-blue-600 px-2 py-1 rounded text-white shadow-lg">{view.label} Selected</span>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center space-y-3 p-4">
                  <UploadIcon className="w-10 h-10 text-gray-500 group-hover:text-blue-400 transition-colors" />
                  <span className="font-semibold text-gray-400 group-hover:text-white">
                    Upload {view.label}
                  </span>
                </div>
              )}
              <input
                id={`upload-${view.id}`}
                type="file"
                className="sr-only"
                accept="image/png, image/jpeg, image/webp"
                onChange={(e) => handleFileChange(view.id, e)}
              />
            </label>
          </div>
        ))}
      </div>

      <button
        onClick={handleStartClick}
        disabled={!hasFiles}
        className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white text-lg font-bold rounded-full shadow-lg hover:shadow-blue-500/25 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none transition-all transform hover:scale-105"
      >
        Start Customizing {hasFiles && `(${Object.keys(selectedFiles).length} photos)`}
      </button>
    </div>
  );
};

export default App;