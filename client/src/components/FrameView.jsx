import { useState } from 'react';

export default function FrameView({ iframeUrl, onIframeLoad }) {
  const [iframeError, setIframeError] = useState(false);

  const handleIframeError = () => {
    setIframeError(true);
  };

  const handleIframeLoad = () => {
    setIframeError(false);
    onIframeLoad?.();
  };

  return (
    <div className="flex-1 bg-white h-[calc(100vh-320px)] md:h-screen">
      {iframeUrl ? (
        <div className="relative h-full">
          <iframe
            src={iframeUrl}
            title="website-viewer"
            sandbox="allow-same-origin allow-scripts allow-popups allow-forms allow-downloads"
            className="w-full h-full border-0"
            onError={handleIframeError}
            onLoad={handleIframeLoad}
          />
          {iframeError && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-50 bg-opacity-90 p-4">
              <div className="text-center p-4 md:p-6 bg-white rounded-lg shadow-lg max-w-md w-full">
                <h3 className="text-lg md:text-xl font-semibold text-gray-700 mb-2">Website Cannot Be Displayed</h3>
                <p className="text-sm md:text-base text-gray-500 mb-3 md:mb-4">
                  This website blocks being displayed in an iframe for security reasons.
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
            <p className="text-sm md:text-base text-gray-500">Enter a URL in the sidebar to view a website</p>
          </div>
        </div>
      )}
    </div>
  );
}