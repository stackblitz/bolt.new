// FilePreview.tsx
import React from 'react';
import { X } from 'lucide-react';

interface FilePreviewProps {
    files: File[];
    imageDataList: string[]; // or imagePreviews: string[]
    onRemove: (index: number) => void;
}

const FilePreview: React.FC<FilePreviewProps> = ({ files, imageDataList, onRemove }) => {
    if (!files || files.length === 0) {
        return null; // Or render a placeholder if desired
    }

    return (
        <div className="flex flex-row overflow-x-auto"> {/* Add horizontal scrolling if needed */}
            {files.map((file, index) => (
                <div key={file.name + file.size} className="mr-2 relative">
                    {/* Display image preview or file icon */}
                    {imageDataList[index] && (
                        <div className="relative">
                            <img src={imageDataList[index]} alt={file.name} className="max-h-20" />
                            <button
                                onClick={() => onRemove(index)}
                                className="absolute -top-2 -right-2 z-10 bg-white rounded-full p-1 shadow-md hover:bg-gray-100"
                            >
                                <div className="bg-black rounded-full p-1">
                                    <X className="w-3 h-3 text-gray-400" strokeWidth={2.5} />
                                </div>
                            </button>
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
};

export default FilePreview;
