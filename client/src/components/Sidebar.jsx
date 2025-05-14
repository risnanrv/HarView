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
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [harData, setHarData] = useState(null);
  const [postMessage, setPostMessage] = useState('');
  const [showUpload, setShowUpload] = useState(false);
  const [harStatus, setHarStatus] = useState('');
  const fileInputRef = useRef(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (url.trim()) {
      onSubmit(url);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      onUploadHAR(file);
      // Reset the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const downloadHar = () => {
    if (!harData) {
      setError('No HAR data available. Please generate HAR first.');
      return;
    }
    try {
      const blob = new Blob([JSON.stringify(harData, null, 2)], { type: 'application/json' });
      const href = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = href;
      link.download = `${new URL(url).hostname}.har`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setHarStatus('HAR file downloaded successfully!');
      setTimeout(() => setHarStatus(''), 3000);
    } catch (err) {
      setError('Failed to download HAR file.');
    }
  };

  const handlePostHarClick = () => {
    setShowUpload(true);
    setPostMessage('');
    setError('');
    setTimeout(() => fileInputRef.current && fileInputRef.current.click(), 100);
  };

  return (
    <div className="w-full md:w-80 bg-white shadow-lg p-4 md:p-6 flex flex-col h-full overflow-y-auto">
      {/* <h1 className="text-xl md:text-2xl font-bold text-gray-800 mb-4 md:mb-6">HAR Viewer</h1> */}
      
      <form onSubmit={handleSubmit} className="mb-4 md:mb-6">
        <div className="mb-4">
          <label htmlFor="url" className="block text-sm font-medium text-gray-700 mb-2">
            Enter Website URL:
          </label>
          <input
            type="url"
            id="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com"
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
          {isLoading ? 'Loading...' : 'Submit'}
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
          >
            Post HAR 
          </label>
        </div>
      </div>

      {error && (
        <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-md text-sm">
          {error}
        </div>
      )}
    </div>
  );
}
