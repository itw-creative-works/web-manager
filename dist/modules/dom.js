// Load external script dynamically
export function loadScript(options) {
  return new Promise((resolve, reject) => {
    // Handle simple string parameter
    if (typeof options === 'string') {
      options = { src: options };
    }

    const {
      src,
      async = true,
      defer = false,
      crossorigin = false,
      integrity = null,
      attributes = [],
      timeout = 60000,
      retries = 0
    } = options;

    if (!src) {
      return reject(new Error('Script source is required'));
    }

    // Check if script already exists
    const existingScript = document.querySelector(`script[src="${src}"]`);
    if (existingScript) {
      return resolve({ script: existingScript, cached: true });
    }

    let timeoutId;
    let retryCount = 0;

    function createAndLoadScript() {
      const script = document.createElement('script');
      script.src = src;
      script.async = async;
      script.defer = defer;

      if (crossorigin) {
        script.crossOrigin = typeof crossorigin === 'string' ? crossorigin : 'anonymous';
      }

      if (integrity) {
        script.integrity = integrity;
      }

      // Add custom attributes
      attributes.forEach(attr => {
        if (attr.name && attr.value !== undefined) {
          script.setAttribute(attr.name, attr.value);
        }
      });

      // Set up timeout
      if (timeout > 0) {
        timeoutId = setTimeout(() => {
          script.remove();
          handleError(new Error(`Script load timeout: ${src}`));
        }, timeout);
      }

      // Event handlers
      script.onload = () => {
        clearTimeout(timeoutId);
        resolve({ script, cached: false });
      };

      script.onerror = (error) => {
        clearTimeout(timeoutId);
        script.remove();
        handleError(new Error(`Failed to load script: ${src}`));
      };

      // Append to document
      (document.head || document.documentElement).appendChild(script);
    }

    function handleError(error) {
      if (retryCount < retries) {
        retryCount++;
        setTimeout(createAndLoadScript, 1000 * retryCount);
      } else {
        reject(error);
      }
    }

    createAndLoadScript();
  });
}

// Return promise that resolves when DOM is ready
export function ready() {
  return new Promise((resolve) => {
    if (document.readyState === 'loading') {
      // Wait for DOM if still loading
      document.addEventListener('DOMContentLoaded', resolve);
    } else {
      // DOM is already ready
      resolve();
    }
  });
}
