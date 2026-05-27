import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import { OptionsApp } from './OptionsApp';
import '@shared/store/useThemeStore';

const rootEl = document.getElementById('root');
if (rootEl) {
  ReactDOM.createRoot(rootEl).render(
    <React.StrictMode>
      <OptionsApp />
    </React.StrictMode>
  );
}
