import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

interface BackButtonProps {
  label?: string;
  onClick?: () => void;
  className?: string;
}

const BackButton: React.FC<BackButtonProps> = ({ label = 'Orqaga', onClick, className }) => {
  const navigate = useNavigate();
  return (
    <button
      type="button"
      onClick={onClick || (() => navigate(-1))}
      className={`flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-blue-500 to-blue-700 text-white font-semibold shadow-md hover:from-blue-600 hover:to-blue-800 transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-blue-400 ${className || ''}`}
      aria-label={label}
    >
      <ArrowLeft className="w-5 h-5" />
      <span>{label}</span>
    </button>
  );
};

export default BackButton; 