import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

import { registerSW } from 'virtual:pwa-register';

registerSW({ immediate: true });

import { MsalProvider } from '@azure/msal-react';
import { msalInstance } from './services/MicrosoftAuthService';

msalInstance.initialize().then(() => {
    ReactDOM.createRoot(document.getElementById('root')!).render(
        <React.StrictMode>
            <MsalProvider instance={msalInstance}>
                <App />
            </MsalProvider>
        </React.StrictMode>,
    )
});
