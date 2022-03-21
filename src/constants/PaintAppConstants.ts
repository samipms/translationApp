const appId = typeof APP_ID !== 'undefined' ? APP_ID : '';
const metaOsAppId =
    typeof PAINT_METAOS_APP_ID !== 'undefined' && PAINT_METAOS_APP_ID
        ? PAINT_METAOS_APP_ID
        : '';
const metaOsAppNamespace = 'paint';

export const PaintAppConstants = {
    appId,
    metaOsAppId,
    metaOsAppNamespace,
    breakpoints: {
        small: 479,
        medium: 639,
        large: 1023,
        extraLarge: 1365,
        extraExtraLarge: 1919,
    },
};

// AAD doesn't support requesting scopes for different resources in the same access token !
export const mfsScopes = [
    'api://a2cb37e1-f3dd-4e1e-a7c4-8cff6cdbf61c/MfsService.Access',
];

export const pushChannelScopes = [
    'https://pushchannel.1drv.ms/PushChannel.ReadWrite.All',
];

export const graphScopes = [
    'Files.Read',
    'Files.ReadWrite.All',
    'Sites.ReadWrite.All',
];
