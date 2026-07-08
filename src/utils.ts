/**
 * SECURITY NOTE:
 * This application stores activation codes and sessions locally in localStorage.
 * Storing secret codes or sensitive admin routes in client-side code is for demo purposes only.
 * For production applications, you MUST implement secure backend authentication, 
 * session cookies, and persistent storage using a database like Firestore or PostgreSQL.
 */

/**
 * Robust copy-to-clipboard function that works in standard environments
 * and provides a fallback using a temporary textarea in restricted environments (like iframes).
 */
export function copyToClipboard(text: string): Promise<boolean> {
  if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
    return navigator.clipboard.writeText(text)
      .then(() => true)
      .catch((err) => {
        console.warn('Navigator clipboard failed, trying fallback:', err);
        return fallbackCopyToClipboard(text);
      });
  } else {
    return Promise.resolve(fallbackCopyToClipboard(text));
  }
}

function fallbackCopyToClipboard(text: string): boolean {
  try {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    
    // Prevent scrolling or zooming
    textArea.style.top = '0';
    textArea.style.left = '0';
    textArea.style.position = 'fixed';
    textArea.style.opacity = '0';
    
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    const successful = document.execCommand('copy');
    document.body.removeChild(textArea);
    return successful;
  } catch (err) {
    console.error('Fallback copy failed: ', err);
    return false;
  }
}
