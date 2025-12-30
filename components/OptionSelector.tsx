
import React from 'react';
import type { ModificationOption } from '../types';

interface OptionSelectorProps<T extends string> {
    title: string;
    options: ModificationOption<T>[];
    onApply: (option: ModificationOption<T>) => void;
    disabled: boolean;
}

const OptionSelector = <T extends string,>({ title, options, onApply, disabled }: OptionSelectorProps<T>): React.ReactElement => {
    return (
        <div className="space-y-4">
            {title && <h3 className="text-xl font-semibold">{title}</h3>}
            <div className="space-y-3">
                {options.map((option) => (
                    <button
                        key={option.value}
                        onClick={() => onApply(option)}
                        disabled={disabled}
                        className="w-full text-left p-4 bg-gray-700 rounded-lg hover:bg-gray-600 border border-gray-600 hover:border-blue-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 group"
                    >
                        <div className="flex flex-col">
                            <span className="font-bold text-gray-100 group-hover:text-blue-400 transition-colors">
                                {option.label}
                            </span>
                            {option.description && (
                                <span className="text-sm text-gray-400 mt-1 leading-tight">
                                    {option.description}
                                </span>
                            )}
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
};

export default OptionSelector;
