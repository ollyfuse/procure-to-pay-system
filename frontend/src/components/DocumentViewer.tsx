import React from 'react';

interface DocumentViewerProps {
  url: string;
}

export const DocumentViewer: React.FC<DocumentViewerProps> = ({ url }) => {
  const isPdf = url.toLowerCase().includes('.pdf');
  const isImage = /\.(jpg|jpeg|png|gif)$/i.test(url);

  if (isPdf) {
    return (
      <div className="border rounded-lg p-4 text-center">
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-teal-600 hover:text-teal-700 underline"
        >
          📄 View PDF Document
        </a>
      </div>
    );
  }

  if (isImage) {
    return (
      <div className="border rounded-lg overflow-hidden">
        <img
          src={url}
          alt="Document"
          className="w-full h-auto max-h-96 object-contain"
        />
      </div>
    );
  }

  return (
    <div className="border rounded-lg p-4 text-center text-gray-500">
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-teal-600 hover:text-teal-700 underline"
      >
        📄 View Document
      </a>
    </div>
  );
};
