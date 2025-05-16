import { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import FrameView from './components/FrameView';

function App() {
  const [iframeUrl, setIframeUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingHAR, setIsGeneratingHAR] = useState(false);
  const [isWebsiteLoaded, setIsWebsiteLoaded] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (url) => {
    setIsLoading(true);
    setError(null);
    setIsWebsiteLoaded(false);
    setIframeUrl(url);
  };

  const handleIframeLoad = () => {
    setIsLoading(false);
    setIsWebsiteLoaded(true);
  };

  // Check if server is running
  useEffect(() => {
    const checkServer = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL || 'http://localhost:4444'}`, { 
          method: 'GET',
          headers: { 'Accept': 'application/json' }
        });
        if (response.ok) {
          console.log('Server is running');
        }
      } catch (err) {
        console.error('Server connection error:', err);
        setError('Cannot connect to server. Please make sure the server is running.');
      }
    };
    
    checkServer();
  }, []);

  const handleDownloadHAR = async () => {
    if (!iframeUrl) {
      setError('No website loaded. Please load a website first.');
      return;
    }

    setIsGeneratingHAR(true);
    setError(null);

    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL || 'http://localhost:4444'}/api/har/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: iframeUrl }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to generate HAR file');
      }

      const data = await response.json();
      
      // Create a pretty-printed version of the HAR data
      const prettyHar = JSON.stringify(data.har, null, 2);
      
      // Check if running on mobile
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      
      // Extract hostname for filename
      const hostname = new URL(iframeUrl).hostname;
      const filename = `${hostname}-${new Date().toISOString().slice(0,10)}.har`;
      
      if (isMobile) {
        // For mobile devices, create a data URL
        const dataUrl = 'data:application/json;charset=utf-8,' + encodeURIComponent(prettyHar);
        
        // Create a temporary link element
        const link = document.createElement('a');
        link.href = dataUrl;
        link.setAttribute('download', filename);
        link.setAttribute('target', '_blank');
        
        // Append to body, click, and remove
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        // For desktop, use blob approach
        const blob = new Blob([prettyHar], { type: 'application/json' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (err) {
      setError(err.message);
      console.error('Download error:', err);
    } finally {
      setIsGeneratingHAR(false);
    }
  };

  const handleUploadHAR = async (file) => {
    if (!file) return;

    const formData = new FormData();
    formData.append('harFile', file);

    try {
      // First check if the file is a valid HAR file by reading it
      const fileReader = new FileReader();
      
      fileReader.onload = async (e) => {
        try {
          // Try to parse the file as JSON
          JSON.parse(e.target.result);
          
          // If parsing succeeds, upload the file
          const response = await fetch(`${import.meta.env.VITE_BACKEND_URL || 'http://localhost:4444'}/api/har/post`, {
            method: 'POST',
            body: formData,
          });

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || 'Failed to upload HAR file');
          }

          const result = await response.json();
          console.log('HAR file uploaded successfully:', result);
        } catch (parseErr) {
          setError('Invalid HAR file format. Please upload a valid JSON HAR file.');
          console.error('Parse error:', parseErr);
        }
      };
      
      fileReader.onerror = () => {
        setError('Error reading the file. Please try again.');
      };
      
      fileReader.readAsText(file);
    } catch (err) {
      setError(err.message);
      console.error('Upload error:', err);
    }
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-100">
      <div className="w-full md:w-80 bg-white shadow-lg">
        <Sidebar
          onSubmit={handleSubmit}
          onDownloadHAR={handleDownloadHAR}
          onUploadHAR={handleUploadHAR}
          isLoading={isLoading}
          isGeneratingHAR={isGeneratingHAR}
          isWebsiteLoaded={isWebsiteLoaded}
          error={error}
        />
      </div>
      <div className="flex-1">
        <FrameView iframeUrl={iframeUrl} onIframeLoad={handleIframeLoad} />
      </div>
    </div>
  );
}

export default App;