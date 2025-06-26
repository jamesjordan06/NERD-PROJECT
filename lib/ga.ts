export const GA_ID = 'G-RZN3Z16TN3';

export function loadGA() {
  if (typeof window === 'undefined' || (window as any).GA_INITIALIZED) return;
  (window as any).GA_INITIALIZED = true;
  const script = document.createElement('script');
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
  script.async = true;
  document.head.appendChild(script);

  (window as any).dataLayer = (window as any).dataLayer || [];
  function gtag(...args: any[]) {
    (window as any).dataLayer.push(args);
  }
  gtag('js', new Date());
  gtag('config', GA_ID);
}
