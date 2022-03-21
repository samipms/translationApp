import { hasProperties, MfsDataStore, MfsItem } from '@metaos/mfs-client';
import { Client } from '@microsoft/microsoft-graph-client';
import { Dispatch, SetStateAction } from 'react';

import { PaletteInformation } from '../canvas-palette/canvas-palette';
import {
    createDriveItem,
    deleteItemByDriveItemId,
    getItemByDriveItemId,
    onedriveSearch,
} from '../graph/GraphServiceApi';
import { PaintUndoInformation } from '../paint-history/get-paint-history';

export const PAINT_NAMESPACE = 'paint';
const PaintFolderPath = '/Apps/paint';

export const createPaintItem = async (
    dataStore: MfsDataStore,
    graphClient: Client,
    dataUrl: string,
    thumbnailImg: string,
    pictureName: string,
    paintUndoInformation: PaintUndoInformation | null = null,
    canvasPaletteInformation: PaletteInformation | null = null,
): Promise<PaintItem> => {
    // save reference in MFS and use its returned ID to store paint data in OneDrive
    return dataStore
        .createItem({
            paint: {
                name: pictureName,
                thumbnail: thumbnailImg,
                canvasPaletteInformation: canvasPaletteInformation
                    ? JSON.stringify(canvasPaletteInformation)
                    : undefined,
            },
            label: 'PaintObject',
            displayText: pictureName,
        })
        .then(async (mfsItem: PaintItem) => {
            const storageData = {
                paint: {
                    id: mfsItem.id,
                    dataUrl: dataUrl,
                    name: pictureName,
                    thumbnail: thumbnailImg,
                    paintUndoInformationJsonString: paintUndoInformation
                        ? JSON.stringify(paintUndoInformation)
                        : undefined,
                    canvasPaletteInformation:
                        mfsItem.canvasPaletteInformationJsonString,
                },
            };
            await createDriveItem(
                graphClient,
                PaintFolderPath,
                mfsItem.id,
                JSON.stringify(storageData),
            );
            return storageData.paint;
        });
};

export const updatePaintItem = async (
    dataStore: MfsDataStore,
    graphClient: Client,
    id: string,
    paintItem: PaintItem,
    thumbnailImg: string,
): Promise<PaintItem> => {
    // patch reference in MFS
    return dataStore
        .patchItem(id, {
            paint: {
                id: id,
                name: paintItem.name,
                thumbnail: thumbnailImg,
                canvasPaletteInformationJsonString:
                    paintItem.canvasPaletteInformationJsonString,
            },
        })
        .then(async () => {
            // patch image data in OneDrive
            const storageData = {
                paint: {
                    id: id,
                    dataUrl: paintItem.dataUrl,
                    name: paintItem.name,
                    thumbnail: thumbnailImg,
                    paintUndoInformationJsonString:
                        paintItem.paintUndoInformationJsonString ?? undefined,
                    canvasPaletteInformationJsonString:
                        paintItem.canvasPaletteInformationJsonString ??
                        undefined,
                },
            };
            await createDriveItem(
                graphClient,
                PaintFolderPath,
                id,
                JSON.stringify(storageData),
            );
            return storageData.paint;
        });
};

export const getAPaintItem = async (
    graphClient: Client,
    paintItemId: string,
    callback: (item: PaintItem) => void,
): Promise<PaintItem | undefined> => {
    return await onedriveSearch(graphClient, paintItemId).then(
        async (result) => {
            if (result) {
                await getItemByDriveItemId(graphClient, result.id).then(
                    (driveItem) => {
                        const xhr = new XMLHttpRequest();
                        const url = driveItem['@microsoft.graph.downloadUrl'];
                        xhr.open('GET', url);
                        xhr.onreadystatechange = function () {
                            if (xhr.readyState == 4 && xhr.status == 200) {
                                const dataItem: PaintItem = JSON.parse(
                                    xhr.responseText,
                                )['paint'];
                                if (dataItem) {
                                    callback(dataItem);
                                    return dataItem;
                                }
                                return undefined;
                            }
                        };
                        xhr.send();
                    },
                );
                return undefined;
            }
        },
    );
};

export const getAllPaintItems = async (
    dataStore: MfsDataStore,
): Promise<PaintItem[]> => {
    const items: PaintItem[] = [];
    for await (const paintItem of dataStore.getItems(isPaintItem)) {
        const dataItem = paintItem['paint'];
        if (dataItem) {
            items.push({
                id: paintItem.id,
                dataUrl: dataItem.dataUrl,
                thumbnail: dataItem.thumbnail,
                name: dataItem.name,
                paintUndoInformationJsonString:
                    dataItem.paintUndoInformationJsonString,
                canvasPaletteInformationJsonString:
                    dataItem.canvasPaletteInformationJsonString,
            });
        }
    }
    return items;
};

export const deleteAPaintItem = async (
    dataStore: MfsDataStore,
    graphClient: Client,
    paintId: string,
): Promise<void> => {
    dataStore.deleteItem(paintId);
    await onedriveSearch(graphClient, paintId).then((result) => {
        if (result) {
            deleteItemByDriveItemId(graphClient, result.id);
        }
    });
};

export type PaintItem = {
    id?: string;
    name?: string;
    dataUrl?: string;
    thumbnail?: string;
    paintUndoInformationJsonString?: string;
    canvasPaletteInformationJsonString?: string;
};

const isPaintItem = (item: MfsItem): item is UnfoldedPaintItem =>
    hasProperties(item, {
        id: true,
        paint: true,
    });
