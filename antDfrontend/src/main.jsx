import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { ConfigProvider } from 'antd';
import App from './App.jsx';
import './index.css';

const container = document.getElementById('root');
const root = createRoot(container);

root.render(
  <StrictMode>
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#667eea',
          colorSuccess: '#10b981',
          colorWarning: '#f59e0b',
          colorError: '#ef4444',
          colorInfo: '#3b82f6',
          borderRadius: 12,
          fontSize: 14,
          fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        },
      }}
    >
      <App />
    </ConfigProvider>
  </StrictMode>
);