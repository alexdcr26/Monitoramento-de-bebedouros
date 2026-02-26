import { X } from 'lucide-react';

interface ImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  altText: string;
}

export default function ImageModal({ isOpen, onClose, imageUrl, altText }: ImageModalProps) {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-80 flex justify-center items-center z-50 transition-opacity duration-300"
      onClick={onClose}
    >
      <div 
        className="relative bg-white p-4 rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh]"
        onClick={(e) => e.stopPropagation()} // Impede que o clique no modal feche o modal
      >
        <button 
          onClick={onClose} 
          className="absolute -top-4 -right-4 bg-white rounded-full p-2 text-gray-700 hover:bg-gray-200 transition-transform duration-200 hover:scale-110 z-10"
        >
          <X className="h-6 w-6" />
        </button>
        <img 
          src={imageUrl} 
          alt={altText} 
          className="w-full h-full object-contain rounded-md"
          style={{ maxHeight: 'calc(90vh - 2rem)' }} // Garante que a imagem não ultrapasse a altura do modal
        />
      </div>
    </div>
  );
}
