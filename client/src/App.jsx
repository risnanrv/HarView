import { useState } from 'react';
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

  const handleDownloadHAR = async () => {
    if (!iframeUrl) return;

    setIsGeneratingHAR(true);
    setError(null);

    try {
      const response = await fetch('http://localhost:5000/api/har/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: iframeUrl }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate HAR file');
      }

      const data = await response.json();
      
      // Create a pretty-printed version of the HAR data
      const prettyHar = JSON.stringify(data.har, null, 2);
      
      // Create blob with the pretty-printed data
      const blob = new Blob([prettyHar], { type: 'application/json' });
      
      // Check if running on mobile
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      
      if (isMobile) {
        // For mobile devices, open in new tab
        const url = window.URL.createObjectURL(blob);
        window.open(url, '_blank');
      } else {
        // For desktop, use download approach
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `network-traffic-${new Date().toISOString().slice(0,10)}.har`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsGeneratingHAR(false);
    }
  };

  const handleUploadHAR = async (file) => {
    if (!file) return;

    const formData = new FormData();
    formData.append('harFile', file);

    try {
      const response = await fetch('http://localhost:5000/api/har/post', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload HAR file');
      }

      const result = await response.json();
      alert('HAR file uploaded successfully!');
    } catch (err) {
      setError(err.message);
      alert('Error uploading HAR file: ' + err.message);
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