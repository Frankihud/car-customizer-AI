
import React from 'react';
import { CarIcon, ResetIcon } from './icons';

interface HeaderProps {
    onReset: () => void;
    showReset: boolean;
}

const Header: React.FC<HeaderProps> = ({ onReset, showReset }) => {
  return (
    <header className="bg-gray-800/50 backdrop-blur-sm border-b border-gray-700 sticky top-0 z-50">
      <nav className="container mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <CarIcon className="w-8 h-8 text-blue-400"/>
          <h1 className="text-2xl font-bold tracking-wider text-white">
            Car<span className="text-blue-400">Customizer</span>AI
          </h1>
        </div>
        {showReset && (
             <button
                onClick={onReset}
                className="flex items-center space-x-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors duration-200"
                title="Start Over"
            >
                <ResetIcon className="w-5 h-5" />
                <span>New Car</span>
            </button>
        )}
      </nav>
    </header>
  );
};

export default Header;
