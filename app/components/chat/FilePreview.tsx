// Remove the lucide-react import
import React from 'react';

// Rest of the interface remains the same
interface FilePreviewProps {
    files: File[];
    imageDataList: string[];
    onRemove: (index: number) => void;
}

const FilePreview: React.FC<FilePreviewProps> = ({ files, imageDataList, onRemove }) => {
    if (!files || files.length === 0) {
        return null;
    }

    return (
        <div className="flex flex-row overflow-x-auto">
            {files.map((file, index) => (
                <div key={file.name + file.size} className="mr-2 relative">
                    {imageDataList[index] && (
                        <div className="relative">
                            <img src={imageDataList[index]} alt={file.name} className="max-h-20" />
                            <button
                                onClick={() => onRemove(index)}
                                className="absolute -top-2 -right-2 z-10 bg-white rounded-full p-1 shadow-md hover:bg-gray-100"
                            >
                                <div className="bg-black rounded-full p-1">
                                    <div className="i-ph:x w-3 h-3 text-gray-400" />
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
