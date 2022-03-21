import { MfsClient, MfsDataStore, MfsHostConfig } from '@metaos/mfs-client';
import { OdspClient, OdspClientConfig } from '@metaos/mfs-loader';

import { PaintAuthProviderOptions } from '../auth/auth';
import { mfsScopes, pushChannelScopes } from '../constants/PaintAppConstants';

const createOdspClient = (
    hostConfig: MfsHostConfig,
    getAccessToken: (
        options?: PaintAuthProviderOptions | undefined,
    ) => Promise<string>,
): MfsClient => {
    const getAccessTokenCallback = async (): Promise<string> =>
        await getAccessToken({
            scopes: mfsScopes,
        });

    const getOdspTokenCallback = async (
        odspSiteDomain: string,
    ): Promise<string> =>
        await getAccessToken({
            scopes: [`https://${odspSiteDomain}/AllSites.Write`],
        });

    const getPushChannelTokenCallback = async (): Promise<string> =>
        await getAccessToken({
            scopes: pushChannelScopes,
        });

    const config: OdspClientConfig = {
        hostConfig,
        getAccessTokenCallback,
        getOdspTokenCallback,
        getPushChannelTokenCallback,
    };

    const client: MfsClient = new OdspClient(config);

    return client;
};

export const getMfsDataStore = async (
    mfsHostConfig: MfsHostConfig,
    getAccessToken: (
        options?: PaintAuthProviderOptions | undefined,
    ) => Promise<string>,
    userId: string,
): Promise<MfsDataStore> => {
    const client = createOdspClient(mfsHostConfig, getAccessToken);
    return await client.loadDataStore();
};
