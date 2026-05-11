/**
 * Configuración de Microsoft Authentication Library (MSAL)
 * para autenticación con cuentas institucionales @unamis.edu.py
 *
 * IMPORTANTE: Reemplazar CLIENT_ID y TENANT_ID con los valores
 * obtenidos desde Azure Portal > Registros de aplicaciones.
 */

import { PublicClientApplication, Configuration } from '@azure/msal-browser';

// ✅ Credenciales oficiales de Azure AD — UNAMIS
const CLIENT_ID = '412fee5a-645d-4279-a73f-52892095e6d3';
const TENANT_ID = '9b1d0475-797e-4136-8de2-8e214966d598';

export const msalConfig: Configuration = {
    auth: {
        clientId: CLIENT_ID,
        authority: `https://login.microsoftonline.com/${TENANT_ID}`,
        redirectUri: window.location.origin,
        navigateToLoginRequestUrl: false,
    },
    cache: {
        cacheLocation: 'sessionStorage',
        storeAuthStateInCookie: true,
    },
    system: {
        allowRedirectInIframe: true,
        windowHashTimeout: 60000,
        iframeHashTimeout: 60000,
        loadFrameTimeout: 0,
        loggerOptions: {
            loggerCallback: (level: any, message: string) => {
                console.log("MSAL:", message);
            },
            logLevel: 3, // Info
            piiLoggingEnabled: false
        }
    }
};

export const loginRequest = {
    scopes: ['openid', 'profile', 'email', 'User.Read'],
    prompt: 'select_account' as const,
};

export const msalInstance = new PublicClientApplication(msalConfig);
