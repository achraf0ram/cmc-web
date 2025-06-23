
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Ensure proper error handling for development
if (typeof window !== 'undefined') {
  window.addEventListener('error', (event) => {
    console.error('Global error:', event.error);
  });
  
  window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
  });
}

console.log('Starting application...');

const container = document.getElementById("root");
if (!container) {
  console.error("Root element not found!");
  throw new Error("Root element not found");
}

console.log('Root element found, creating React root...');

const root = createRoot(container);
root.render(<App />);

console.log('App rendered successfully');
