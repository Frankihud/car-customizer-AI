
import React, { useState } from 'react';
import type { Modification, WheelOption, BodykitOption, BackgroundOption, ModificationOption } from '../types';
import { ModificationType } from '../types';
import ColorPicker from './ColorPicker';
import OptionSelector from './OptionSelector';
import { ResetIcon } from './icons';

const wheelOptions: WheelOption[] = [
    { 
        label: 'Black 5-Spoke', 
        value: 'w1', 
        prompt: 'change the wheels to black 5-spoke racing rims',
        description: 'A classic minimalist racing look. Provides a stealthy, performance-oriented aesthetic.'
    },
    { 
        label: 'Chrome Deep Dish', 
        value: 'w2', 
        prompt: 'change the wheels to chrome deep dish rims',
        description: 'High-polish mirror finish with a wide lip. Perfect for VIP and show car styles.'
    },
    { 
        label: 'Bronze TE37 Style', 
        value: 'w3', 
        prompt: 'change the wheels to bronze TE37 style rims',
        description: 'Iconic JDM styling. The bronze finish adds a premium contrast to almost any body color.'
    },
    { 
        label: 'White Rally Style', 
        value: 'w4', 
        prompt: 'change the wheels to white rally style multispoke rims',
        description: 'High-visibility white spokes designed for a rugged, motorsport-inspired look.'
    },
];

const bodykitOptions: BodykitOption[] = [
    { 
        label: 'Street Style', 
        value: 'b1', 
        prompt: 'add a sporty street style bodykit with a front lip spoiler and side skirts',
        description: 'Clean and subtle additions that enhance the car\'s natural lines without being overly aggressive.'
    },
    { 
        label: 'Widebody Kit', 
        value: 'b2', 
        prompt: 'add an aggressive widebody kit with fender flares',
        description: 'Massively broadens the car\'s profile with bolted-on or molded fender extensions for a muscular presence.'
    },
    { 
        label: 'Drift Style', 
        value: 'b3', 
        prompt: 'add a drift style bodykit with a large rear wing and aggressive front bumper',
        description: 'Maximized aerodynamics and cooling. Includes a tall GT-style wing for high-speed stability.'
    },
    { 
        label: 'Carbon Fiber Kit', 
        value: 'b4', 
        prompt: 'add a carbon fiber bodykit, including a front splitter and rear diffuser',
        description: 'High-tech composite materials. Adds exposed carbon weave details to splitters, skirts, and diffusers.'
    },
];

const vinylOptions: ModificationOption<string>[] = [
    { 
        label: 'Side Racing Stripes', 
        value: 'v1', 
        prompt: 'add aggressive dual racing stripes in a contrasting color along the side of the car, following the body lines',
        description: 'Elongates the car visually and emphasizes the beltline for a classic muscle or GT look.'
    },
    { 
        label: 'Japanese "Drift King" Kanji', 
        value: 'v3', 
        prompt: 'add Japanese kanji for "Drift King" (ドリフトキング) on the rear quarter panel in a stylized, bold font',
        description: 'Authentic drift culture aesthetics. Adds a bold graphic element to the rear of the vehicle.'
    },
];

const backgroundOptions: BackgroundOption[] = [
    {
        label: 'Luxury Garage',
        value: 'bg1',
        prompt: 'change the background to a clean, well-lit luxury modern garage showroom with concrete floors',
        description: 'A professional, high-end studio environment to showcase the vehicle.'
    },
    {
        label: 'Cyberpunk City',
        value: 'bg2',
        prompt: 'change the background to a futuristic neon-lit cyberpunk city street at night with rain reflections',
        description: 'Dark, moody, and colorful neon lighting for a cinematic look.'
    },
    {
        label: 'Race Track',
        value: 'bg3',
        prompt: 'change the background to a professional race track circuit during the day with curbing visible',
        description: 'Put the car in its natural habitat on the tarmac.'
    },
    {
        label: 'Scenic Coastal Road',
        value: 'bg4',
        prompt: 'change the background to a scenic coastal highway with the ocean in the distance and sunset lighting',
        description: 'Warm lighting and beautiful scenery for a lifestyle aesthetic.'
    },
];

interface ControlPanelProps {
    onApply: (modification: Modification) => void;
    onReset: () => void;
    isLoading: boolean;
}

const ControlPanel: React.FC<ControlPanelProps> = ({ onApply, onReset, isLoading }) => {
    const [activeTab, setActiveTab] = useState<ModificationType>(ModificationType.COLOR);
    const [vinylPrompt, setVinylPrompt] = useState<string>('');
    const [wheelMode, setWheelMode] = useState<'style' | 'color'>('style');

    const renderPanel = () => {
        switch(activeTab) {
            case ModificationType.COLOR:
                return <ColorPicker onApply={onApply} disabled={isLoading} />;
            case ModificationType.WHEELS:
                return (
                    <div className="space-y-6">
                        <div className="flex space-x-2 bg-gray-700 p-1 rounded-lg">
                            <button 
                                onClick={() => setWheelMode('style')}
                                className={`flex-1 py-2 text-sm font-semibold rounded-md transition-all ${
                                    wheelMode === 'style' 
                                    ? 'bg-gray-600 text-white shadow ring-1 ring-white/10' 
                                    : 'text-gray-400 hover:text-gray-200 hover:bg-gray-700/50'
                                }`}
                            >
                                Rim Style
                            </button>
                            <button 
                                onClick={() => setWheelMode('color')}
                                className={`flex-1 py-2 text-sm font-semibold rounded-md transition-all ${
                                    wheelMode === 'color' 
                                    ? 'bg-gray-600 text-white shadow ring-1 ring-white/10' 
                                    : 'text-gray-400 hover:text-gray-200 hover:bg-gray-700/50'
                                }`}
                            >
                                Rim Paint
                            </button>
                        </div>
                        
                        {wheelMode === 'style' ? (
                             <OptionSelector 
                                title="Wheel Selection" 
                                options={wheelOptions} 
                                onApply={(opt) => onApply({type: ModificationType.WHEELS, value: opt.value, prompt: opt.prompt})} 
                                disabled={isLoading} 
                            />
                        ) : (
                            <ColorPicker 
                                onApply={onApply} 
                                disabled={isLoading} 
                                modificationType={ModificationType.WHEELS}
                                promptPrefix="change the wheels color to"
                            />
                        )}
                    </div>
                );
            case ModificationType.BODYKIT:
                return <OptionSelector title="Aero & Body" options={bodykitOptions} onApply={(opt) => onApply({type: ModificationType.BODYKIT, value: opt.value, prompt: opt.prompt})} disabled={isLoading} />;
            case ModificationType.VINYL:
                return (
                    <div className="space-y-6">
                        <div>
                           <OptionSelector 
                                title="Popular Vinyls"
                                options={vinylOptions} 
                                onApply={(opt) => onApply({type: ModificationType.VINYL, value: opt.value, prompt: opt.prompt})} 
                                disabled={isLoading} 
                            />
                        </div>

                        <div className="relative">
                           <div className="absolute inset-0 flex items-center" aria-hidden="true">
                                <div className="w-full border-t border-gray-600" />
                            </div>
                            <div className="relative flex justify-center">
                                <span className="bg-gray-800 px-2 text-sm text-gray-400">OR</span>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h3 className="text-xl font-semibold">Custom Design</h3>
                            <p className="text-sm text-gray-400">Describe exactly what sticker or vinyl pattern you want to see.</p>
                            <textarea 
                                value={vinylPrompt}
                                onChange={(e) => setVinylPrompt(e.target.value)}
                                className="w-full h-24 p-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition text-gray-100 placeholder-gray-500"
                                placeholder="e.g., a gold geometric pattern wrapping around the front bumper..."
                                disabled={isLoading}
                            />
                            <button
                                onClick={() => onApply({type: ModificationType.VINYL, value: vinylPrompt, prompt: vinylPrompt})}
                                disabled={isLoading || !vinylPrompt.trim()}
                                className="w-full bg-blue-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-600 disabled:text-gray-400 disabled:cursor-not-allowed transition-all"
                            >
                                Apply Custom Design
                            </button>
                        </div>
                    </div>
                );
            case ModificationType.BACKGROUND:
                return <OptionSelector title="Environment" options={backgroundOptions} onApply={(opt) => onApply({type: ModificationType.BACKGROUND, value: opt.value, prompt: opt.prompt})} disabled={isLoading} />;
        }
    };
    
    const tabs = [
        { type: ModificationType.COLOR, label: 'Paint' },
        { type: ModificationType.WHEELS, label: 'Wheels' },
        { type: ModificationType.BODYKIT, label: 'Aero' },
        { type: ModificationType.VINYL, label: 'Graphics' },
        { type: ModificationType.BACKGROUND, label: 'Background' },
    ];

    return (
        <div className="bg-gray-800 p-6 rounded-xl shadow-lg h-full flex flex-col border border-gray-700">
            <div className="flex flex-col mb-4">
                <div className="flex justify-between items-start">
                    <div>
                        <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-white">Virtual Workshop</h2>
                        <p className="text-xs text-gray-500 mt-1">Modifications apply to all views</p>
                    </div>
                    <button
                        onClick={onReset}
                        disabled={isLoading}
                        className="flex items-center space-x-2 text-sm text-gray-400 hover:text-red-400 disabled:opacity-50 transition-colors bg-gray-700/50 hover:bg-gray-700 px-3 py-1.5 rounded-lg"
                        title="Reset all modifications"
                    >
                        <ResetIcon className="w-4 h-4"/>
                        <span>Reset</span>
                    </button>
                </div>
            </div>
            
            <div className="border-b border-gray-700 mb-6">
                <nav className="-mb-px flex space-x-1 overflow-x-auto scrollbar-hide" aria-label="Tabs">
                    {tabs.map(tab => (
                        <button
                            key={tab.type}
                            onClick={() => setActiveTab(tab.type)}
                            className={`whitespace-nowrap py-3 px-4 border-b-2 font-semibold text-sm transition-all
                                ${activeTab === tab.type 
                                    ? 'border-blue-500 text-blue-400 bg-blue-500/5' 
                                    : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-600'}`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </nav>
            </div>
            
            <div className="flex-grow overflow-y-auto pr-1 custom-scrollbar">
                {renderPanel()}
            </div>
        </div>
    );
};

export default ControlPanel;
