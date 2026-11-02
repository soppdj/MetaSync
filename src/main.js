// src/main.js
import { createApp } from 'vue';
import App from './App.vue';
import './style.css';

// Register PWA Service Worker if supported in browser
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(err => {
      console.log('SW registration error:', err);
    });
  });
}

createApp(App).mount('#app');
