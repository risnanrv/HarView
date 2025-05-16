import { useState, useRef } from 'react';
import axios from 'axios';

export default function Sidebar({
  onSubmit,
  onDownloadHAR,
  onUploadHAR,
  isLoading,
  isGeneratingHAR,
  isWebsiteLoaded,
  error
}) {
  const [url, setUrl] = useState('');
  const [localError, setLocalError] = useState('');
  const [harStatus, setHarStatus] = useState('');
  const fileInputRef = useRef(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (url.trim()) {
      // Ensure URL has protocol
      let processedUrl = url.trim();
      if (!processedUrl.startsWith('http://') && !processedUrl.startsWith('https://')) {
        processedUrl = 'https://' + processedUrl;
      }
      onSubmit(processedUrl);
      setLocalError('');
    } else {
      setLocalError('Please enter a valid URL');
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.name.endsWith('.har')) {
        onUploadHAR(file);
        setHarStatus('HAR file uploaded successfully!');
        setTimeout(() => setHarStatus(''), 3000);
      } else {
        setLocalError('Please select a valid HAR file (.har extension)');
      }
      // Reset the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handlePostHarClick = () => {
    setLocalError('');
    setTimeout(() => fileInputRef.current && fileInputRef.current.click(), 100);
  };

  return (
    <div className="w-full md:w-80 bg-white shadow-lg p-4 md:p-6 flex flex-col h-full overflow-y-auto">
      <h1 className="text-xl md:text-2xl font-bold text-gray-800 mb-4 md:mb-6">HAR Viewer MVP</h1>
      
      <form onSubmit={handleSubmit} className="mb-4 md:mb-6">
        <div className="mb-4">
          <label htmlFor="url" className="block text-sm font-medium text-gray-700 mb-2">
            Enter Website URL:
          </label>
          <input
            type="text"
            id="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="example.com or https://example.com"
            className="w-full px-3 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
            required
          />
        </div>
        <button
          type="submit"
          disabled={isLoading}
          className={`w-full py-2.5 px-4 rounded-md text-white font-medium text-base ${
            isLoading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {isLoading ? 'Loading...' : 'Load Website'}
        </button>
      </form>

      <div className="space-y-3 md:space-y-4">
        <button
          onClick={onDownloadHAR}
          disabled={!isWebsiteLoaded || isGeneratingHAR}
          className={`w-full py-2.5 px-4 rounded-md text-white font-medium text-base ${
            !isWebsiteLoaded || isGeneratingHAR
              ? 'bg-green-300 cursor-not-allowed'
              : 'bg-green-600 hover:bg-green-700'
          }`}
          title="Generate and download HAR file for the loaded website"
        >
          {isGeneratingHAR ? 'Generating HAR...' : 'Download HAR'}
        </button>

        <div className="relative">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".har"
            className="hidden"
            id="har-upload"
          />
          <label
            htmlFor="har-upload"
            className="block w-full py-2.5 px-4 rounded-md text-white font-medium bg-purple-600 hover:bg-purple-700 text-center cursor-pointer text-base"
            title="Upload a HAR file to the server"
          >
            Post HAR
          </label>
        </div>
      </div>

      {harStatus && (
        <div className="mt-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded-md text-sm">
          {harStatus}
        </div>
      )}

      {(error || localError) && (
        <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-md text-sm">
          {error || localError}
        </div>
      )}
    </div>
  );
}
