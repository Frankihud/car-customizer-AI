
import React, { useState } from 'react';
import type { Modification } from '../types';
import { ModificationType } from '../types';

interface ColorPickerProps {
    onApply: (modification: Modification) => void;
    disabled: boolean;
    modificationType?: ModificationType;
    promptPrefix?: string;
}

const colors = [
    { name: 'Gloss Black', hex: '#1a1a1a', prompt: 'gloss black' },
    { name: 'Matte Black', hex: '#262626', prompt: 'matte black' },
    { name: 'Nardo Gray', hex: '#8a9297', prompt: 'nardo gray' },
    { name: 'Alpine White', hex: '#f0f0f0', prompt: 'alpine white' },
    { name: 'Cherry Red', hex: '#c20000', prompt: 'cherry red pearl' },
    { name: 'Midnight Blue', hex: '#001f5c', prompt: 'midnight blue metallic' },
    { name: 'British Racing Green', hex: '#004225', prompt: 'british racing green' },
    { name: 'Electric Yellow', hex: '#ffff00', prompt: 'electric yellow' },
    { name: 'Midnight Purple', hex: '#3c1361', prompt: 'midnight purple' },
    { name: 'Chrome', hex: '#c0c0c0', prompt: 'mirror-like chrome' },
];

const ColorPicker: React.FC<ColorPickerProps> = ({ 
    onApply, 
    disabled, 
    modificationType = ModificationType.COLOR, 
    promptPrefix = "change the car's paint color to" 
}) => {
    const [selectedColor, setSelectedColor] = useState(colors[0]);
    const [customColorHex, setCustomColorHex] = useState('#3b82f6');
    const [customColorName, setCustomColorName] = useState('');
    const [mode, setMode] = useState<'preset' | 'custom'>('preset');

    const handlePresetClick = (color: typeof colors[0]) => {
        setSelectedColor(color);
        setMode('preset');
    };

    const handleCustomHexChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setCustomColorHex(e.target.value);
        setMode('custom');
    };

    const handleCustomNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setCustomColorName(e.target.value);
        setMode('custom');
    };

    const handleApply = () => {
        if (mode === 'preset') {
            onApply({
                type: modificationType,
                value: selectedColor.name,
                prompt: `${promptPrefix} ${selectedColor.prompt}`,
            });
        } else {
            // Use the name if provided, otherwise the hex value, or a combination if useful.
            // Generally for AI, a descriptive name is better, but hex works too.
            const colorValue = customColorName.trim() ? customColorName : customColorHex;
            onApply({
                type: modificationType,
                value: 'Custom Color',
                prompt: `${promptPrefix} ${colorValue}`,
            });
        }
    };

    return (
        <div className="space-y-6">
            <div className="space-y-3">
                <h3 className="text-xl font-semibold">Presets</h3>
                <div className="grid grid-cols-5 gap-3">
                    {colors.map((color) => (
                        <button
                            key={color.name}
                            onClick={() => handlePresetClick(color)}
                            className={`w-full h-12 rounded-lg border-2 transition-transform duration-150 transform hover:scale-110 ${
                                mode === 'preset' && selectedColor.name === color.name ? 'border-blue-400 scale-110' : 'border-transparent'
                            }`}
                            style={{ backgroundColor: color.hex }}
                            title={color.name}
                            disabled={disabled}
                        />
                    ))}
                </div>
            </div>

            <div className="space-y-3">
                <h3 className="text-xl font-semibold">Custom Palette</h3>
                <div 
                    className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                        mode === 'custom' 
                        ? 'border-blue-500 bg-gray-700/50' 
                        : 'border-gray-700 bg-gray-800 hover:border-gray-600'
                    }`}
                    onClick={() => setMode('custom')}
                >
                    <div className="flex items-center gap-4">
                        <div className="flex-shrink-0">
                            <label htmlFor="custom-color-input" className="sr-only">Choose color</label>
                            <input
                                id="custom-color-input"
                                type="color"
                                value={customColorHex}
                                onChange={handleCustomHexChange}
                                disabled={disabled}
                                className="h-12 w-12 p-0.5 rounded cursor-pointer bg-gray-600 border border-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div className="flex-grow">
                            <label htmlFor="custom-color-name" className="sr-only">Color Name</label>
                            <input
                                id="custom-color-name"
                                type="text"
                                value={customColorName}
                                onChange={handleCustomNameChange}
                                onFocus={() => setMode('custom')}
                                placeholder="e.g. Matte Olive Green, Carbon Fiber..."
                                disabled={disabled}
                                className="w-full bg-gray-900 border border-gray-600 text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-3 placeholder-gray-500 transition-colors"
                            />
                        </div>
                    </div>
                    <p className="text-xs text-gray-400 mt-2 ml-1">
                        Select a color or type a description for a specific finish.
                    </p>
                </div>
            </div>

            <div className="pt-2">
                <button
                    onClick={handleApply}
                    disabled={disabled}
                    className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-600 disabled:text-gray-400 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-blue-900/20"
                >
                    Apply {mode === 'preset' ? selectedColor.name : (customColorName || customColorHex)}
                </button>
            </div>
        </div>
    );
};

export default ColorPicker;
