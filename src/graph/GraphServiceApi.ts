import { Client, ResponseType } from '@microsoft/microsoft-graph-client';
import { DriveItem, SharingLink } from '@microsoft/microsoft-graph-types';

import { graphApiFormatStrings, searchQueryFormatStrings } from './constants';
import { dataURLtoFile, format } from './helper';

export const getRootFolderPath = async (client: Client): Promise<string> => {
    const apiUrl = graphApiFormatStrings.GetRoot;
    const response = await client.api(apiUrl).get();

    if (response) {
        return response.webUrl;
    }

    return '';
};

export const createDriveItem = async (
    client: Client,
    parentFolderPath: string,
    paintId: string,
    content: string,
): Promise<DriveItem | undefined> => {
    const apiUrl = format(graphApiFormatStrings.Create, [
        parentFolderPath,
        paintId,
    ]);
    const response: DriveItem = await client
        .api(apiUrl)
        .headers({ 'Content-Type': 'text/plain' })
        .put(content);
    if (response) {
        return response;
    }
    return undefined;
};

export const getAllChildrenItemsByDriveItemId = async (
    client: Client,
    folderDriveItemId: string,
): Promise<DriveItem[] | undefined> => {
    const apiUrl = format(graphApiFormatStrings.GetAllItems, [
        folderDriveItemId,
    ]);
    const response = await client.api(apiUrl).get();
    if (response.value) {
        return response.value;
    }
    return undefined;
};

export const getItemByDriveItemId = async (
    client: Client,
    itemId: string,
): Promise<DriveItem | undefined> => {
    const apiUrl = format(graphApiFormatStrings.GetItem, [itemId]);
    const response: DriveItem = await client.api(apiUrl).get();
    if (response) {
        return response;
    }
    return undefined;
};

export const deleteItemByDriveItemId = async (
    client: Client,
    itemId: string,
): Promise<void> => {
    const apiUrl = format(graphApiFormatStrings.Delete, [itemId]);
    await client.api(apiUrl).delete();
    return;
};

export const onedriveSearch = async (
    client: Client,
    fileName: string,
): Promise<DriveItem | undefined> => {
    const apiUrl = format(graphApiFormatStrings.OneDriveSearch, [fileName]);
    const result = await client.api(apiUrl).get();

    // TODO: error handling for more than one matching fileName. Most cases there should only be one.
    if (result && result.value && result.value.length === 1) {
        return result.value[0];
    }
    return undefined;
};

export const querySearch = async (
    client: Client,
    searchTerm: string,
    queryPath: string,
): Promise<DriveItem | undefined> => {
    const apiUrl = graphApiFormatStrings.SearchAPISearchQuery;
    const content = format(searchQueryFormatStrings.Content, [
        searchTerm,
        queryPath,
    ]);
    const response = await client
        .api(apiUrl)
        .responseType(ResponseType.JSON)
        .post(content);

    const hitsContainer = response.value[0].hitsContainers[0];

    if (hitsContainer.hits) {
        const driveItem: DriveItem = hitsContainer.hits[0].resource;
        return driveItem;
    }
    return undefined;
};

export const uploadImageToOneDrive = async (
    client: Client,
    base64image: string,
): Promise<string | undefined> => {
    const fileName = `Paint-${new Date().getMilliseconds()}`;
    const file = dataURLtoFile(base64image, fileName);
    const type = file.type.split('/')[1];
    const apiUrl = format(graphApiFormatStrings.CreateImage, [
        `${fileName}.${type}`,
    ]);
    const response = await client
        .api(apiUrl)
        .headers({ 'Content-Type': file.type })
        .put(file);
    if (response.id) {
        return response.id;
    }
    return undefined;
};

export const createSharingLink = async (
    client: Client,
    itemId: string,
): Promise<SharingLink | undefined> => {
    const apiUrl = format(graphApiFormatStrings.CreateSharingLink, [itemId]);
    const permission = {
        type: 'edit',
    };
    const response = await client
        .api(apiUrl)
        .responseType(ResponseType.JSON)
        .post(permission);

    if (response.link?.webUrl) {
        return response.link;
    }
    return undefined;
};
