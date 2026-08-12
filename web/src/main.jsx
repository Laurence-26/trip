import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';

const MODE = import.meta.env.VITE_APP_MODE;

async function mount() {
  let Root;
  if (MODE === 'driver') {
    const { default: DriverApp } = await import('./DriverApp');
    Root = DriverApp;
    if ('serviceWorker' in navigator && import.meta.env.PROD) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').catch(() => {});
      });
    }
  } else if (MODE === 'owner') {
    const { default: OwnerApp } = await import('./OwnerApp');
    Root = OwnerApp;
  } else {
    const { default: App } = await import('./App');
    Root = App;
    if ('serviceWorker' in navigator && import.meta.env.PROD) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').catch(() => {});
      });
    }
  }
  ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode><Root /></React.StrictMode>
  );
}

mount();
