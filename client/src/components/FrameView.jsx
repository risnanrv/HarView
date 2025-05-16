import { useState, useEffect } from 'react';

export default function FrameView({ iframeUrl, onIframeLoad }) {
  const [iframeError, setIframeError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Reset error state when URL changes
  useEffect(() => {
    if (iframeUrl) {
      setIframeError(false);
      setErrorMessage('');
    }
  }, [iframeUrl]);

  const handleIframeError = () => {
    setIframeError(true);
    setErrorMessage('This website cannot be displayed in the frame. It may have X-Frame-Options that prevent embedding.');
  };

  const handleIframeLoad = (e) => {
    try {
      // Check if we can access the iframe content
      // If not, it might be due to same-origin policy
      const iframe = e.target;
      if (iframe.contentWindow.location.href) {
        setIframeError(false);
        onIframeLoad?.();
      }
    } catch (err) {
      // This error occurs when we can't access the iframe due to same-origin policy
      // But the page might still be loading correctly
      console.log('Frame access restricted, but content may still load:', err.message);
      onIframeLoad?.(); // Still trigger the load event
    }
  };

  return (
    <div className="flex-1 bg-white h-[calc(100vh-320px)] md:h-screen">
      {iframeUrl ? (
        <div className="relative h-full">
          <iframe
            src={iframeUrl}
            title="website-viewer"
            sandbox="allow-same-origin allow-scripts allow-popups allow-forms allow-downloads allow-modals allow-presentation allow-top-navigation"
            className="w-full h-full border-0"
            onError={handleIframeError}
            onLoad={handleIframeLoad}
            referrerPolicy="no-referrer"
          />
          {iframeError && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-50 bg-opacity-90 p-4">
              <div className="text-center p-4 md:p-6 bg-white rounded-lg shadow-lg max-w-md w-full">
                <h3 className="text-lg md:text-xl font-semibold text-gray-700 mb-2">Website Cannot Be Displayed</h3>
                <p className="text-sm md:text-base text-gray-500 mb-3 md:mb-4">
                  {errorMessage || "This website blocks being displayed in an iframe for security reasons."}
                </p>
                <p className="text-xs md:text-sm text-gray-400">
                  You can still download the HAR file to analyze the website's network traffic.
                </p>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="h-full flex items-center justify-center bg-gray-50 p-4">
          <div className="text-center max-w-md w-full">
            <h3 className="text-lg md:text-xl font-semibold text-gray-700 mb-2">No Website Loaded</h3>
            <p className="text-sm md:text-base text-gray-500">Enter a URL in the sidebar and click "Load Website"</p>
            <p className="text-xs text-gray-400 mt-2">Note: Some websites may not load due to security restrictions</p>
          </div>
        </div>
      )}
    </div>
  );
}