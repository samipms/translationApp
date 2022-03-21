import { MfsDataStore } from '@metaos/mfs-client/dist/store/mfsDataStore';
import { Client } from '@microsoft/microsoft-graph-client';
import { Dispatch, SetStateAction } from 'react';

import { CanvasPalette } from '../canvas-palette/canvas-palette';
import {
    createPaintItem,
    deleteAPaintItem,
    getAllPaintItems,
    getAPaintItem,
    PaintItem,
    updatePaintItem,
} from '../mfs/paintData';
import { PaintHistory } from '../paint-history/get-paint-history';

export interface PaintStorageManager {
    getAllItems: () => Promise<PaintItem[]>;
    getAnItem: (
        itemId: string,
        callback: (item: PaintItem) => void,
    ) => Promise<PaintItem>;
    runAutoSave: () => Promise<PaintItem>;
    runSaveACopy: (
        newFileName: string,
        replaceAutoSave?: boolean,
    ) => Promise<PaintItem>;
    changeCurrentPaintItem: (paintItem: PaintItem) => void;
    runDeletePaintItem: (paintItem: PaintItem) => void;
    clearCurrentPaintItem: () => void;
    addAutoSaveListener: (func: () => void) => void;
}

const AUTOSAVE_PREFIX = 'autosave';
const DEFAULT_THUMBNAIL_HEIGHT = 180;
const DEFAULT_THUMBNAIL_WIDTH = 300;

export const getPaintStorageManager = (
    dataStore: MfsDataStore,
    graphClient: Client,
    canvasRef: HTMLCanvasElement,
    paintHistory: PaintHistory,
    canvasPalette: CanvasPalette,
): PaintStorageManager => {
    let currentPaintItem: PaintItem | null = null;
    const autoSaveListeners: Array<() => void> = [];

    const clearCurrentPaintItem = () => {
        currentPaintItem = null;
        paintHistory.clearHistory();
    };

    const addAutoSaveListener = (func): void => {
        autoSaveListeners.push(func);
    };

    const invokeAutoSaveListeners = () => {
        autoSaveListeners.forEach((a) => {
            a();
        });
    };

    const getAllItems = (): Promise<PaintItem[]> => {
        return getAllPaintItems(dataStore);
    };

    const getAnItem = (
        itemId: string,
        callback: (item: PaintItem) => void,
    ): Promise<PaintItem> => {
        return getAPaintItem(graphClient, itemId, callback);
    };

    const runAutoSave = (): Promise<PaintItem> => {
        const save = canvasRef.toDataURL();
        const fileName = getAutoSaveName();
        invokeAutoSaveListeners();
        if (!currentPaintItem) {
            return resizeImage(save).then((thumbnailImg) => {
                return createPaintItem(
                    dataStore,
                    graphClient,
                    save,
                    thumbnailImg,
                    fileName,
                    paintHistory.getHistory(),
                    canvasPalette.getPaletteInformation(),
                ).then((res) => {
                    currentPaintItem = res;
                    return res;
                });
            });
        } else {
            if (currentPaintItem && currentPaintItem.id) {
                currentPaintItem.dataUrl = save;
                currentPaintItem.canvasPaletteInformationJsonString =
                    JSON.stringify(canvasPalette.getPaletteInformation());
                return resizeImage(save).then((thumbnailImg) => {
                    return updatePaintItem(
                        dataStore,
                        graphClient,
                        currentPaintItem.id,
                        currentPaintItem,
                        thumbnailImg,
                    ).then((res) => {
                        return res;
                    });
                });
            } else {
                throw 'Failed to patch paint item on autosave due to null id.';
            }
        }
    };

    const runDeletePaintItem = (paintItem: PaintItem) => {
        if (paintItem.id) {
            deleteAPaintItem(dataStore, graphClient, paintItem.id);
            if (paintItem.id === currentPaintItem.id) {
                clearCurrentPaintItem();
            }
        }
    };

    const runSaveACopy = (
        newFileName: string,
        replaceAutoSave?: boolean,
    ): Promise<PaintItem> => {
        if (currentPaintItem && currentPaintItem.dataUrl) {
            return resizeImage(currentPaintItem.dataUrl).then(
                (thumbnailImg) => {
                    return createPaintItem(
                        dataStore,
                        graphClient,
                        currentPaintItem.dataUrl,
                        thumbnailImg,
                        newFileName,
                        currentPaintItem.paintUndoInformationJsonString
                            ? JSON.parse(
                                  currentPaintItem.paintUndoInformationJsonString,
                              )
                            : undefined,
                        canvasPalette.getPaletteInformation()
                            ? canvasPalette.getPaletteInformation()
                            : undefined,
                    ).then((res) => {
                        const oldAutoSaveId = currentPaintItem?.id;
                        if (replaceAutoSave && oldAutoSaveId) {
                            deleteAPaintItem(
                                dataStore,
                                graphClient,
                                oldAutoSaveId,
                            );
                        }
                        currentPaintItem = res;
                        return res;
                    });
                },
            );
        } else {
            throw 'Cannot save a copy for null data url.';
        }
    };

    const getAutoSaveName = (): string => {
        return `${AUTOSAVE_PREFIX}-${new Date().toTimeString()}`;
    };

    const changeCurrentPaintItem = (paintItem: PaintItem) => {
        currentPaintItem = paintItem;
    };

    const resizeImage = (base64Str: string): Promise<string> => {
        return new Promise((resolve) => {
            const img = new Image();
            img.src = base64Str;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                canvas.width = DEFAULT_THUMBNAIL_WIDTH;
                canvas.height = DEFAULT_THUMBNAIL_HEIGHT;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(
                    img,
                    0,
                    0,
                    DEFAULT_THUMBNAIL_WIDTH,
                    DEFAULT_THUMBNAIL_HEIGHT,
                );
                resolve(canvas.toDataURL('image/png', 1));
            };
        });
    };

    return {
        getAnItem,
        getAllItems,
        runAutoSave,
        runSaveACopy,
        changeCurrentPaintItem,
        runDeletePaintItem,
        clearCurrentPaintItem,
        addAutoSaveListener,
    };
};
