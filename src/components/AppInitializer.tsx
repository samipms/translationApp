import { Label, PrimaryButton, Stack } from '@fluentui/react';
import { MfsDataStore, MfsHostConfig } from '@metaos/mfs-client';
import * as metaosAppSdk from '@microsoft/metaos-app-sdk';
import { Client } from '@microsoft/microsoft-graph-client';
import React, { useEffect, useState } from 'react';

import { createAuthProvider, PaintAuthProvider } from '../auth/auth';
import { graphScopes, PaintAppConstants } from '../constants/PaintAppConstants';
import { getMfsDataStore } from '../mfs/getMfsDataStore';
import { HostName } from '../theming/theme';
import { App } from './App';
import styles from './AppInitializer.module.scss';
import { LoadingPage } from './LoadingPage/LoadingPage';
import { MfsContext } from './MfsContext/MfsContext';

enum LoadingState {
    Unauthenticated,
    Authing,
    Loading,
    Loaded,
    Error,
}

type LoadingStateContainer =
    | {
          state: LoadingState.Unauthenticated;
          authProvider: PaintAuthProvider;
      }
    | {
          state: LoadingState.Authing;
          authProvider: PaintAuthProvider;
      }
    | {
          state: LoadingState.Loading;
          authProvider: PaintAuthProvider;
      }
    | {
          state: LoadingState.Loaded;
          authProvider?: PaintAuthProvider;
          mfs?: MfsDataStore;
          graph?: Client;
      }
    | {
          state: LoadingState.Error;
          authProvider: PaintAuthProvider;
          error: Error;
      };

// App Initializer handles service auth and mfs/graph initialization
// No app functionality other than login should be in this component
// Load App.tsx as soon as initialization is finished
const AppInitializer = (): JSX.Element => {
    const [loadingState, setLoadingState] = useState<LoadingStateContainer>({
        state: LoadingState.Authing,
        authProvider: createAuthProvider(),
    });

    const [theme, setTheme] = useState<string>('light-theme');

    const onSignIn = async (authProvider: PaintAuthProvider) => {
        try {
            await authProvider.login();
            setLoadingState({ state: LoadingState.Loading, authProvider });
        } catch (error) {
            setLoadingState({ state: LoadingState.Error, error, authProvider });
        }
    };

    useEffect(() => {
        const trySilentLogin = async (authProvider: PaintAuthProvider) => {
            try {
                await authProvider.getCachedToken();
                setLoadingState({ state: LoadingState.Loading, authProvider });
            } catch {
                // Silent-auth failed, move to unauthenticated state and wait until user clicks sign in
                setLoadingState({
                    state: LoadingState.Unauthenticated,
                    authProvider,
                });
            }
        };

        const loadAsync = async (authProvider: PaintAuthProvider) => {
            try {
                const mfsStore = await initMfsAsync(authProvider);
                const graphService = await initGraphAsync(authProvider);
                setLoadingState({
                    state: LoadingState.Loaded,
                    authProvider: authProvider,
                    mfs: mfsStore,
                    graph: graphService,
                });
            } catch (error: Error) {
                setLoadingState({
                    state: LoadingState.Error,
                    error,
                    authProvider,
                });
            }
        };

        switch (loadingState.state) {
            case LoadingState.Authing:
                trySilentLogin(loadingState.authProvider);
                break;
            case LoadingState.Loading:
                loadAsync(loadingState.authProvider);
                break;
        }
    }, [loadingState]);

    // Set theme
    useEffect(() => {
        new URL(location.href).searchParams.get('theme');
        const params = new URL(location.href).searchParams;
        const themeOverride = params.get('theme');
        if (themeOverride) {
            switch (themeOverride) {
                case 'dark':
                    setTheme('dark-theme');
                    break;
                case 'contrast':
                    setTheme('high-contrast-theme');
                    break;
                default:
                    setTheme('light-theme');
                    break;
            }
        } else {
            metaosAppSdk.app.getContext().then((context) => {
                const handleThemeChange = (theme: string) => {
                    switch (theme) {
                        case 'dark':
                            setTheme('dark-theme');
                            break;
                        case 'contrast':
                            setTheme('high-contrast-theme');
                            break;
                        // light theme
                        default:
                            switch (context?.app?.host?.name) {
                                case HostName.office:
                                    setTheme('light-theme-office');
                                    break;
                                case HostName.teams:
                                    setTheme('light-theme-teams');
                                    break;
                                case HostName.outlook:
                                    setTheme('light-theme-outlook');
                                    break;
                                default:
                                    setTheme('light-theme');
                                    break;
                            }
                            break;
                    }
                };
                metaosAppSdk.app.registerOnThemeChangeHandler(
                    handleThemeChange,
                );
                handleThemeChange(context?.app?.theme);
            });
        }
    }, []);

    const loadWithoutMfs = () => {
        setLoadingState({
            state: LoadingState.Loaded,
            authProvider: undefined,
            mfs: undefined,
            graph: undefined,
        });
    };

    return (
        <div
            id="paint-theme-container"
            className={`${theme} ${styles.container}`}
        >
            {loadingState.state === LoadingState.Unauthenticated && (
                <Stack className={styles.authing} tokens={{ childrenGap: 12 }}>
                    <Stack.Item>
                        <PrimaryButton
                            text={'Sign in'}
                            onClick={() => onSignIn(loadingState.authProvider)}
                        />
                    </Stack.Item>
                    <Stack.Item>
                        <PrimaryButton
                            text={'Skip sign'}
                            onClick={loadWithoutMfs}
                        />
                    </Stack.Item>
                </Stack>
            )}
            {(loadingState.state === LoadingState.Authing ||
                loadingState.state === LoadingState.Loading) && (
                <LoadingPage title="Loading" />
            )}
            {loadingState.state === LoadingState.Loaded && (
                <MfsContext.Provider
                    value={{
                        dataStore: loadingState.mfs,
                        graphClient: loadingState.graph,
                    }}
                >
                    <App />
                </MfsContext.Provider>
            )}
            {loadingState.state === LoadingState.Error && (
                <Stack className={styles.error} tokens={{ childrenGap: 12 }}>
                    <Stack.Item grow={false}>
                        {IS_DEBUG
                            ? `Loading error: ${loadingState.error.message}`
                            : 'Authentication failed. Please try again.'}
                    </Stack.Item>
                    <Stack.Item>
                        <PrimaryButton
                            text={'Sign in'}
                            onClick={() => onSignIn(loadingState.authProvider)}
                        />
                    </Stack.Item>
                    <Stack.Item>
                        <Label>Skip sign without mfs functionality</Label>
                        <PrimaryButton
                            text={'Skip sign'}
                            onClick={loadWithoutMfs}
                        />
                    </Stack.Item>
                </Stack>
            )}
        </div>
    );
};

const initMfsAsync = async (
    authProvider: PaintAuthProvider,
): Promise<MfsDataStore> => {
    const mfsHostConfig: MfsHostConfig = {
        id: PaintAppConstants.appId,
        prefix: PaintAppConstants.metaOsAppNamespace,
    };
    const activeUser = authProvider.getActiveUser();

    const mfsDataStore = await getMfsDataStore(
        mfsHostConfig,
        authProvider.getAccessToken,
        activeUser.upn,
    );

    return mfsDataStore;
};

const initGraphAsync = async (
    authProvider: PaintAuthProvider,
): Promise<Client> => {
    const getTokenAsync = async (): Promise<string> => {
        return authProvider.getAccessToken({
            scopes: graphScopes,
        });
    };
    const token = await getTokenAsync();
    const graphService = await Client.init({
        authProvider: (done: any) => {
            done(null, token);
        },
    });

    return graphService;
};

export default AppInitializer;
