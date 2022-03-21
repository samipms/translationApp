import { MfsHostConfig } from '@metaos/mfs-client';
import { TinyliciousClient } from '@metaos/mfs-loader-dev';

export const createTinyliciousClient = (
    hostConfig: MfsHostConfig,
): TinyliciousClient => {
    let createNew = false;

    if (window.location.hash.length === 0) {
        createNew = true;
        window.location.hash = Date.now().toString();
    }

    const documentId = window.location.hash.substring(1);
    const client = new TinyliciousClient({
        hostConfig,
        userId: documentId,
        createNewStore: createNew,
    });

    return client;
};
