import puppeteer from 'puppeteer';
import puppeteerHar from 'puppeteer-har';

export async function generateHar(url) {
  let browser;
  try {
    // Validate URL
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url;
    }

    console.log('Launching browser...');
    browser = await puppeteer.launch({ 
      headless: 'new',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--disable-gpu',
        '--disable-extensions',
        '--disable-component-extensions-with-background-pages',
        '--disable-default-apps',
        '--mute-audio',
        '--no-default-browser-check',
        '--no-first-run',
        '--disable-background-networking',
        '--disable-background-timer-throttling',
        '--disable-backgrounding-occluded-windows',
        '--disable-breakpad',
        '--disable-client-side-phishing-detection',
        '--disable-hang-monitor',
        '--disable-ipc-flooding-protection',
        '--disable-popup-blocking',
        '--disable-prompt-on-repost',
        '--disable-renderer-backgrounding',
        '--disable-sync',
        '--force-color-profile=srgb',
        '--metrics-recording-only',
        '--no-experiments',
        '--safebrowsing-disable-auto-update'
      ]
    });

    console.log('Creating new page...');
    const page = await browser.newPage();
    
    // Set viewport
    await page.setViewport({ width: 1280, height: 800 });

    // Block unnecessary resources to speed up loading
    await page.setRequestInterception(true);
    page.on('request', (request) => {
      const resourceType = request.resourceType();
      if (['image', 'stylesheet', 'font', 'media'].includes(resourceType)) {
        request.abort();
      } else {
        request.continue();
      }
    });

    console.log('Setting up HAR recording...');
    const har = new puppeteerHar(page);
    
    // Start HAR recording
    await har.start({ path: 'result.har' });
    
    console.log(`Navigating to ${url}...`);
    try {
      // Use networkidle2 and shorter timeout
      await page.goto(url, { 
        waitUntil: 'networkidle2',
        timeout: 30000 // 30 seconds timeout
      });
    } catch (navErr) {
      if (navErr.name === 'TimeoutError') {
        throw new Error('Navigation timeout: The website took too long to load. Try a different site or check your connection.');
      } else {
        throw navErr;
      }
    }
    
    console.log('Getting page content and title...');
    // Get the page content and title
    const content = await page.content();
    const title = await page.title();
    const hostname = new URL(url).hostname;
    
    console.log('Stopping HAR recording...');
    // Stop HAR recording
    await har.stop();

    // Read the HAR file
    const fs = await import('fs/promises');
    const harData = JSON.parse(await fs.readFile('result.har', 'utf8'));
    
    // Format the HAR data with proper indentation
    const formattedHarData = {
      log: {
        version: harData.log.version,
        creator: {
          name: "HAR Viewer",
          version: "1.0"
        },
        pages: harData.log.pages,
        entries: harData.log.entries.map(entry => ({
          startedDateTime: entry.startedDateTime,
          time: entry.time,
          request: {
            method: entry.request.method,
            url: entry.request.url,
            httpVersion: entry.request.httpVersion,
            cookies: entry.request.cookies,
            headers: entry.request.headers,
            queryString: entry.request.queryString,
            postData: entry.request.postData,
            headersSize: entry.request.headersSize,
            bodySize: entry.request.bodySize
          },
          response: {
            status: entry.response.status,
            statusText: entry.response.statusText,
            httpVersion: entry.response.httpVersion,
            cookies: entry.response.cookies,
            headers: entry.response.headers,
            content: entry.response.content,
            redirectURL: entry.response.redirectURL,
            headersSize: entry.response.headersSize,
            bodySize: entry.response.bodySize
          },
          cache: entry.cache,
          timings: entry.timings,
          serverIPAddress: entry.serverIPAddress,
          connection: entry.connection
        }))
      }
    };
    
    console.log('HAR generation completed successfully');
    return { 
      html: content,
      har: formattedHarData,
      metadata: {
        title: title || hostname,
        hostname: hostname
      }
    };
  } catch (error) {
    console.error('Detailed HAR Generation Error:', {
      message: error.message,
      stack: error.stack,
      url: url
    });
    throw new Error(error.message);
  } finally {
    if (browser) {
      console.log('Closing browser...');
      await browser.close();
    }
  }
}
