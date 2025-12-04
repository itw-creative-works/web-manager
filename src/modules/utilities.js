// Copy text to clipboard
export function clipboardCopy(input) {
  // Get the text from the input
  const text = input && input.nodeType
    ? input.value || input.innerText || input.innerHTML
    : input;

  // Try to use the modern clipboard API
  if (navigator.clipboard && navigator.clipboard.writeText) {
    return navigator.clipboard.writeText(text).catch(() => {
      fallbackCopy(text);
    });
  } else {
    fallbackCopy(text);
  }

  function fallbackCopy(text) {
    const el = document.createElement('textarea');
    el.setAttribute('style', 'width:1px;border:0;opacity:0;');
    el.value = text;
    document.body.appendChild(el);
    el.select();

    try {
      document.execCommand('copy');
    } catch (e) {
      console.error('Failed to copy to clipboard');
    }

    document.body.removeChild(el);
  }
}

// Escape HTML to prevent XSS
let shadowElement;
export function escapeHTML(str) {
  if (typeof str !== 'string') {
    return '';
  }

  shadowElement = shadowElement || document.createElement('p');
  shadowElement.innerHTML = '';

  // This automatically escapes HTML entities like <, >, &, etc.
  shadowElement.appendChild(document.createTextNode(str));

  // This is needed to escape quotes to prevent attribute injection
  return shadowElement.innerHTML.replace(/["']/g, (m) => {
    switch (m) {
      case '"':
        return '&quot;';
      default:
        return '&#039;';
    }
  });
}

// Show notification
export function showNotification(message, options = {}) {
  // Handle different input types
  let text = message;
  let type = options.type || 'info';

  // If message is an Error object, extract message and default to danger
  if (message instanceof Error) {
    text = message.message;
    type = options.type || 'danger';
  }

  // Handle string as second parameter for backwards compatibility
  if (typeof options === 'string') {
    options = { type: options };
    type = options.type;
  }

  // Extract options
  const timeout = options.timeout !== undefined ? options.timeout : 5000;

  const $notification = document.createElement('div');
  $notification.className = `alert alert-${type} alert-dismissible fade show position-fixed top-0 start-50 translate-middle-x mt-5`;
  $notification.style.zIndex = '9999';
  $notification.innerHTML = `
    ${text}
    <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
  `;

  document.body.appendChild($notification);

  // Auto-remove after timeout (unless timeout is 0)
  if (timeout > 0) {
    setTimeout(() => {
      $notification.remove();
    }, timeout);
  }
}

// Get platform (OS)
export function getPlatform() {
  const ua = navigator.userAgent.toLowerCase();
  const platform = (navigator.userAgentData?.platform || navigator.platform || '').toLowerCase();

  // Check userAgent for mobile platforms (more reliable than platform string)
  if (/iphone|ipad|ipod/.test(ua)) {
    return 'ios';
  }
  if (/android/.test(ua)) {
    return 'android';
  }

  // Check platform string for desktop OS
  if (/win/.test(platform)) {
    return 'windows';
  }
  if (/mac/.test(platform)) {
    return 'mac';
  }
  if (/cros/.test(ua)) {
    return 'chromeos';
  }
  if (/linux/.test(platform)) {
    return 'linux';
  }

  return 'unknown';
}

// Get runtime environment
export function getRuntime() {
  // Browser extension (Chrome, Edge, Opera, Brave, Firefox, Safari, etc.)
  if (
    (typeof chrome !== 'undefined' && chrome.runtime?.id)
    || (typeof browser !== 'undefined' && browser.runtime?.id)
    || (typeof safari !== 'undefined' && safari.extension)
  ) {
    return 'browser-extension';
  }

  // // Electron (main process, or renderer with nodeIntegration, or via userAgent)
  // if (
  //   (typeof process !== 'undefined' && process.versions?.electron) ||
  //   (typeof navigator !== 'undefined' && /electron/i.test(navigator.userAgent))
  // ) {
  //   return 'electron';
  // }

  // // Node.js (no window)
  // if (typeof window === 'undefined') {
  //   return 'node';
  // }

  // Default: web browser
  return 'web';
}

// Check if mobile device
export function isMobile() {
  try {
    // Try modern API first
    const m = navigator.userAgentData?.mobile;
    if (typeof m !== 'undefined') {
      return m === true;
    }
  } catch (e) {
    // Silent fail
  }

  // Fallback to media query
  try {
    return window.matchMedia('(max-width: 767px)').matches;
  } catch (e) {
    return false;
  }
}

// Get device type based on screen width
export function getDeviceType() {
  const width = window.innerWidth;

  // Mobile: < 768px (Bootstrap's md breakpoint)
  if (width < 768) {
    return 'mobile';
  }

  // Tablet: 768px - 1199px (between md and xl)
  if (width < 1200) {
    return 'tablet';
  }

  // Desktop: >= 1200px
  return 'desktop';
}

// Get context information
export function getContext() {
  // Return context information
  return {
    client: {
      language: navigator.language,
      mobile: isMobile(),
      deviceType: getDeviceType(),
      platform: getPlatform(),
      runtime: getRuntime(),
      userAgent: navigator.userAgent,
      url: window.location.href,
    },
    browser: {
      vendor: navigator.vendor,
    },
    // screen: {
    //   width: window.screen?.width,
    //   height: window.screen?.height,
    //   availWidth: window.screen?.availWidth,
    //   availHeight: window.screen?.availHeight,
    //   colorDepth: window.screen?.colorDepth,
    //   pixelRatio: window.devicePixelRatio || 1,
    // },
    // viewport: {
    //   width: window.innerWidth,
    //   height: window.innerHeight,
    // },
  };
}
