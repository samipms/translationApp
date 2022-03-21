import {
    InteractionRequiredAuthError,
    PublicClientApplication,
} from '@azure/msal-browser';

import { PaintAppConstants } from '../constants/PaintAppConstants';

export type ActiveUser = {
    id: string;
    upn: string;
    name?: string;
};

export type PaintAuthProvider = {
    getCachedToken: () => Promise<string>;
    getAccessToken: (options?: PaintAuthProviderOptions) => Promise<string>;
    login: (scopes?: string[]) => Promise<string>;
    logout: () => void;
    getActiveUser: () => ActiveUser;
};

export type PaintAuthProviderOptions = {
    scopes?: string[];
};

const msalAuthConfig = {
    auth: {
        clientId: PaintAppConstants.appId,
        authority: 'https://login.microsoftonline.com/common/',
    },
    cache: {
        cacheLocation: 'localstorage',
    },
};

export const createAuthProvider = (): PaintAuthProvider => {
    const config = msalAuthConfig;
    const userAgentApplication = new PublicClientApplication(config);

    const accounts = userAgentApplication.getAllAccounts();
    if (accounts.length === 1) {
        userAgentApplication.setActiveAccount(accounts[0]);
    }

    const getCachedToken = async (): Promise<string> => {
        const response = await userAgentApplication.acquireTokenSilent({
            scopes: [],
        });
        return response.accessToken;
    };

    const getAccessToken = async (
        options?: PaintAuthProviderOptions,
    ): Promise<string> => {
        const request = {
            scopes: options?.scopes,
        };

        try {
            const response = await userAgentApplication.acquireTokenSilent({
                ...request,
            });
            return response.accessToken;
        } catch (error) {
            if (error instanceof InteractionRequiredAuthError) {
                const response = await userAgentApplication.acquireTokenPopup(
                    request,
                );
                return response.accessToken;
            } else {
                throw error;
            }
        }
    };

    const login = async (scopes?: string[]): Promise<string> => {
        const request = {
            scopes: scopes,
        };

        if (userAgentApplication.getActiveAccount()) {
            const response = await getAccessToken(request);
            return response;
        } else {
            // user is not logged in, or multiple users logged in, specific user needs to log in and be set as active user
            const response = await userAgentApplication.loginPopup(request);
            userAgentApplication.setActiveAccount(response.account);
            return response.accessToken;
        }
    };

    const logout = () => {
        userAgentApplication.logoutRedirect();
    };

    const getActiveUser = (): ActiveUser => {
        const user = userAgentApplication.getActiveAccount();
        if (user) {
            return {
                id: user.localAccountId,
                upn: user.username,
                name: user.name,
            };
        } else {
            throw 'user not defined';
        }
    };

    // This is the interface that needs to be provided. Whenever a token request is made from graph client, it will try:
    // 1- If the user is signed in, try to acquire an access token silently => acquireTokenSilent
    // 2- If the token requires a consent prompt => acquireTokenPopup
    // 3- If the user is not signed in, bring out sign in popup UI and sign them in, then reattempt 1 => loginPopup
    return {
        getCachedToken,
        getAccessToken,
        login,
        logout,
        getActiveUser,
    };
};
