
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ReactCompareSlider, ReactCompareSliderImage } from 'react-compare-slider';
import ControlPanel from './ControlPanel';
import Spinner from './Spinner';
import { DownloadIcon, ZoomInIcon, ZoomOutIcon, FitIcon, HandIcon } from './icons';
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
  
  // Zoom & Pan State
  const [zoom, setZoom] = useState<number>(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isPanMode, setIsPanMode] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

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
  
  // Reset Zoom when changing views
  useEffect(() => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
    setIsPanMode(false);
  }, [activeViewId]);

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

  // Zoom Handlers
  const handleZoomIn = () => setZoom(z => Math.min(z + 0.5, 4));
  const handleZoomOut = () => {
    setZoom(z => {
        const newZoom = Math.max(z - 0.5, 1);
        if (newZoom === 1) {
            setPan({ x: 0, y: 0 });
            setIsPanMode(false);
        }
        return newZoom;
    });
  };
  const handleFit = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
    setIsPanMode(false);
  };
  const togglePanMode = () => {
      if (zoom > 1) {
        setIsPanMode(!isPanMode);
      }
  };

  // Pan Handlers
  const handleMouseDown = (e: React.MouseEvent) => {
      if (!isPanMode || zoom === 1) return;
      setIsDragging(true);
      setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
      e.preventDefault(); 
  };

  const handleMouseMove = (e: React.MouseEvent) => {
      if (!isDragging) return;
      setPan({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
      e.preventDefault();
  };

  const handleMouseUp = () => {
      setIsDragging(false);
  };

  const handleWheel = (e: React.WheelEvent) => {
    if (e.ctrlKey || isPanMode) {
         e.preventDefault();
         e.stopPropagation();
         if (e.deltaY < 0) {
             handleZoomIn();
         } else {
             handleZoomOut();
         }
    }
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
        <div 
            className="relative rounded-xl overflow-hidden bg-gray-900 shadow-2xl group border border-gray-700 flex justify-center items-center bg-black/20"
            ref={containerRef}
            onWheel={handleWheel}
        >
            {/* Zoom Toolbar */}
            <div className="absolute top-4 right-4 z-40 flex flex-col gap-2 bg-gray-800/90 backdrop-blur rounded-lg p-2 border border-gray-600 shadow-xl transition-opacity opacity-0 group-hover:opacity-100">
                <button onClick={handleZoomIn} className="p-2 hover:bg-gray-700 rounded text-gray-200 hover:text-white" title="Zoom In">
                    <ZoomInIcon className="w-5 h-5" />
                </button>
                <button onClick={handleZoomOut} className="p-2 hover:bg-gray-700 rounded text-gray-200 hover:text-white" title="Zoom Out">
                    <ZoomOutIcon className="w-5 h-5" />
                </button>
                <button onClick={handleFit} className="p-2 hover:bg-gray-700 rounded text-gray-200 hover:text-white" title="Fit to Screen">
                    <FitIcon className="w-5 h-5" />
                </button>
                <div className="h-px bg-gray-600 my-1 w-full"></div>
                <button 
                    onClick={togglePanMode} 
                    className={`p-2 rounded transition-colors ${isPanMode ? 'bg-blue-600 text-white shadow' : 'hover:bg-gray-700 text-gray-200 hover:text-white'} ${zoom === 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
                    title={zoom === 1 ? "Zoom in to pan" : "Toggle Pan Mode"}
                    disabled={zoom === 1}
                >
                    <HandIcon className="w-5 h-5" />
                </button>
            </div>

            {/* Global Loading Overlay */}
            {isGlobalLoading && (
                <div className="absolute inset-0 bg-black/70 flex flex-col justify-center items-center z-50 backdrop-blur-md transition-all duration-300 pointer-events-none">
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
            
            {/* Error Overlay */}
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

            {/* Zoomable Viewport */}
            <div 
                className={`w-full h-full overflow-hidden transition-cursor duration-150 ${isPanMode ? (isDragging ? 'cursor-grabbing' : 'cursor-grab') : 'cursor-default'}`}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
            >
                <div 
                    style={{ 
                        transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                        transition: isDragging ? 'none' : 'transform 0.1s ease-out',
                        transformOrigin: 'center center',
                    }}
                    className="w-full h-full flex justify-center items-center"
                >
                     {/* Wrapper to handle pointer events for panning vs slider interaction */}
                    <div className={isPanMode ? 'pointer-events-none' : ''}>
                        <ReactCompareSlider
                            itemOne={
                                <ReactCompareSliderImage 
                                    src={activeView.original} 
                                    alt={`${activeView.label} Original`} 
                                    style={{ maxHeight: '70vh', width: 'auto', maxWidth: '100%', height: 'auto', objectFit: 'contain' }}
                                />
                            }
                            itemTwo={
                                <ReactCompareSliderImage 
                                    src={activeView.modified} 
                                    alt={`${activeView.label} Modified`} 
                                    style={{ maxHeight: '70vh', width: 'auto', maxWidth: '100%', height: 'auto', objectFit: 'contain' }}
                                />
                            }
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
                    </div>
                </div>
            </div>
            
            <div className="absolute bottom-4 left-4 z-10 pointer-events-none">
                 <span className="bg-black/60 backdrop-blur text-white text-xs font-bold px-2 py-1 rounded border border-white/10">Original</span>
            </div>
            <div className="absolute bottom-4 right-4 z-10 pointer-events-none">
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
