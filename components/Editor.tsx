
import React, { useState, useEffect, useCallback } from 'react';
import { ReactCompareSlider, ReactCompareSliderImage } from 'react-compare-slider';
import ControlPanel from './ControlPanel';
import Spinner from './Spinner';
import { DownloadIcon } from './icons';
import { applyModification } from '../services/geminiService';
import type { Modification, CarView } from '../types';

interface EditorProps {
  initialViews: CarView[];
}

interface ViewState {
  id: string;
  label: string;
  original: string;
  modified: string;
  isLoading: boolean;
  error: string | null;
}

const Editor: React.FC<EditorProps> = ({ initialViews }) => {
  const [viewStates, setViewStates] = useState<ViewState[]>([]);
  const [activeViewId, setActiveViewId] = useState<string>('');
  const [isGlobalLoading, setIsGlobalLoading] = useState<boolean>(true);
  const [activeModification, setActiveModification] = useState<Modification | null>(null);

  // Initialize views from files
  useEffect(() => {
    const loadImages = async () => {
      setIsGlobalLoading(true);
      const loadedViews: ViewState[] = [];

      for (const view of initialViews) {
        try {
          const base64 = await new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target?.result as string);
            reader.readAsDataURL(view.file);
          });
          
          loadedViews.push({
            id: view.id,
            label: view.label,
            original: base64,
            modified: base64,
            isLoading: false,
            error: null
          });
        } catch (error) {
          console.error(`Failed to load image for ${view.label}`, error);
        }
      }

      setViewStates(loadedViews);
      if (loadedViews.length > 0) {
        setActiveViewId(loadedViews[0].id);
      }
      setIsGlobalLoading(false);
    };

    loadImages();
  }, [initialViews]);
  
  const handleApplyModification = useCallback(async (mod: Modification) => {
    setActiveModification(mod);
    setIsGlobalLoading(true);

    // Update all views to loading state
    setViewStates(prev => prev.map(v => ({ ...v, isLoading: true, error: null })));
    
    try {
      // Process all views in parallel
      const promises = viewStates.map(async (view) => {
        try {
            // Apply modification to the current modified image to chain edits
            const result = await applyModification(view.modified, mod.prompt);
            
            return {
                id: view.id,
                success: true,
                data: result ? `data:${result.mimeType};base64,${result.data}` : null
            };
        } catch (error) {
            console.error(`Error processing view ${view.id}:`, error);
            return { id: view.id, success: false, error: 'Failed to modify' };
        }
      });

      const results = await Promise.all(promises);

      setViewStates(prev => prev.map(view => {
        const result = results.find(r => r.id === view.id);
        if (result && result.success && result.data) {
            return { ...view, modified: result.data, isLoading: false };
        } else {
            return { ...view, isLoading: false, error: result?.error || 'Unknown error' };
        }
      }));

    } catch (err) {
      console.error(err);
      setViewStates(prev => prev.map(v => ({ ...v, isLoading: false, error: 'Global error occurred' })));
    } finally {
      setIsGlobalLoading(false);
      setActiveModification(null);
    }
  }, [viewStates]);
  
  const handleResetImage = () => {
    setViewStates(prev => prev.map(v => ({
        ...v,
        modified: v.original,
        error: null
    })));
  };

  const handleDownload = () => {
    const activeView = viewStates.find(v => v.id === activeViewId);
    if (!activeView?.modified) return;

    const link = document.createElement('a');
    link.href = activeView.modified;
    link.download = `car-customizer-${activeView.label.replace(/\s+/g, '-').toLowerCase()}-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const activeView = viewStates.find(v => v.id === activeViewId);
  
  if (isGlobalLoading && viewStates.length === 0) {
    return <div className="flex justify-center items-center h-96"><Spinner /></div>;
  }

  if (!activeView) return null;

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      <div className="flex-grow lg:w-2/3 flex flex-col gap-6">
        {/* View Switcher with Thumbnails */}
        <div className="flex justify-between items-end">
            {viewStates.length > 1 ? (
                <div className="flex items-center space-x-4 bg-gray-800 p-3 rounded-xl overflow-x-auto border border-gray-700 shadow-sm max-w-[80%]">
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wider px-2">Views</span>
                    <div className="h-8 w-px bg-gray-700"></div>
                    {viewStates.map(view => (
                        <button
                            key={view.id}
                            onClick={() => setActiveViewId(view.id)}
                            className={`relative group flex items-center gap-3 p-1.5 pr-4 rounded-lg transition-all duration-200 border ${
                                activeViewId === view.id 
                                ? 'bg-gray-700 border-blue-500/50 ring-1 ring-blue-500/50' 
                                : 'border-transparent hover:bg-gray-700/50'
                            }`}
                        >
                            <div className="w-12 h-9 rounded bg-gray-900 overflow-hidden relative">
                                <img src={view.original} alt={view.label} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                            </div>
                            <span className={`text-sm font-medium ${activeViewId === view.id ? 'text-blue-400' : 'text-gray-400 group-hover:text-gray-300'}`}>
                                {view.label}
                            </span>
                            
                            {/* Loading Indicator for specific view */}
                            {view.isLoading && (
                                <div className="absolute top-0 right-0 -mt-1 -mr-1">
                                    <span className="flex h-3 w-3">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
                                    </span>
                                </div>
                            )}
                        </button>
                    ))}
                </div>
            ) : <div />}

            <button
                onClick={handleDownload}
                disabled={isGlobalLoading}
                className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-blue-600 text-white rounded-lg border border-gray-700 hover:border-blue-500 transition-all shadow-sm"
                title="Download current view"
            >
                <DownloadIcon className="w-5 h-5" />
                <span className="font-semibold text-sm">Download</span>
            </button>
        </div>

        {/* Main Editor Area */}
        <div className="relative rounded-xl overflow-hidden bg-gray-800 shadow-2xl aspect-[4/3] group border border-gray-700">
            {isGlobalLoading && (
                <div className="absolute inset-0 bg-black/70 flex flex-col justify-center items-center z-20 backdrop-blur-md transition-all duration-300">
                    <Spinner />
                    <p className="mt-6 text-xl font-bold text-white tracking-tight">Applying Modifications</p>
                    {activeModification && (
                        <p className="text-sm text-blue-300 mt-2 px-8 text-center max-w-md animate-pulse">
                            "{activeModification.prompt}"
                        </p>
                    )}
                    <p className="text-xs text-gray-500 mt-6 font-mono">
                        Updating {viewStates.length} view{viewStates.length > 1 ? 's' : ''} simultaneously
                    </p>
                </div>
            )}
            
            {activeView.error && (
                <div className="absolute top-4 left-4 right-4 bg-red-500/10 border border-red-500/50 backdrop-blur-md text-red-200 p-4 rounded-lg z-30 flex items-center gap-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                        <p className="font-bold">Generation Failed</p>
                        <p className="text-sm opacity-90">{activeView.error}</p>
                    </div>
                </div>
            )}

            <ReactCompareSlider
            itemOne={<ReactCompareSliderImage src={activeView.original} alt={`${activeView.label} Original`} />}
            itemTwo={<ReactCompareSliderImage src={activeView.modified} alt={`${activeView.label} Modified`} />}
            handle={
                <div className="slider-handle">
                    <button className="shadow-lg transform transition-transform group-hover:scale-110 active:scale-95">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5 text-gray-800">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 15L12 18.75 15.75 15m-7.5-6L12 5.25 15.75 9" />
                        </svg>
                    </button>
                </div>
            }
            />
            
            <div className="absolute bottom-4 left-4 z-10">
                 <span className="bg-black/60 backdrop-blur text-white text-xs font-bold px-2 py-1 rounded border border-white/10">Original</span>
            </div>
            <div className="absolute bottom-4 right-4 z-10">
                 <span className="bg-blue-600/80 backdrop-blur text-white text-xs font-bold px-2 py-1 rounded shadow-lg border border-blue-400/30">Modified</span>
            </div>
        </div>
      </div>

      <div className="lg:w-1/3 min-w-[320px]">
        <ControlPanel onApply={handleApplyModification} onReset={handleResetImage} isLoading={isGlobalLoading} />
      </div>
    </div>
  );
};

export default Editor;
