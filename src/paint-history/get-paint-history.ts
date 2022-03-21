import { PaintItem } from '../mfs/paintData';

export interface PaintItemUndo {
    paintItem?: PaintItem;
    deltaRegion?: PaintCordinate[];
}

export interface PaintCordinate {
    x: number;
    y: number;
}

export interface PaintUndoInformation {
    undos: Array<PaintItemUndo>;
    redos: Array<PaintItemUndo>;
}

export interface PaintHistoryHooks {
    onMouseUp: () => void;
    onMouseDown: () => void;
}

export interface PaintHistory {
    popLastUndo: () => void;
    popLastRedo: () => void;
    loadToCanvas: (item: PaintItemUndo) => void;
    getHistory: () => PaintUndoInformation;
    setHistory: (paintInformation: PaintUndoInformation) => void;
    addOnStackChangeListener: (func: (p: PaintUndoInformation) => void) => void;
    paintHistoryHooks: PaintHistoryHooks;
    clearHistory: () => void;
}

const ENCODING_TYPE = 'image/bmp';
const PADDING = 10;

export const getPaintHistory = (
    canvasRef: HTMLCanvasElement,
    canvasContext: CanvasRenderingContext2D,
): PaintHistory => {
    let undoStack: PaintItemUndo[] = [];
    const onStackChangeListeners: Array<(p: PaintUndoInformation) => void> = [];
    let undoRecord: PaintItemUndo;
    let redoStack: PaintItemUndo[] = [];
    let blocked = false;
    let lastImage = canvasContext.getImageData(
        0,
        0,
        canvasRef.width,
        canvasRef.height,
    );

    const popLastUndo = (): void => {
        if (blocked) {
            return;
        }
        blocked = true;
        const undo = undoStack.pop();
        invokeOnStackChangeListeners();
        if (undo) {
            if (canvasRef) {
                if (undo.deltaRegion) {
                    takeRegionSnapshot(undo.deltaRegion).then((redo) => {
                        redoStack.push(redo);
                        invokeOnStackChangeListeners();
                        loadToCanvas(undo).then(() => {
                            blocked = false;
                        });
                    });
                }
            }
        } else {
            blocked = false;
        }
    };

    const popLastRedo = (): void => {
        if (blocked) {
            return;
        }
        blocked = true;
        const redo = redoStack.pop();
        invokeOnStackChangeListeners();
        if (redo) {
            if (canvasRef) {
                const canvasDataURL = canvasRef.toDataURL(ENCODING_TYPE);
                if (redo.deltaRegion) {
                    takeRegionSnapshot(redo.deltaRegion, canvasDataURL).then(
                        (undo) => {
                            undoStack.push(undo);
                            invokeOnStackChangeListeners();
                            loadToCanvas(redo).then(() => {
                                blocked = false;
                            });
                        },
                    );
                }
            }
        } else {
            blocked = false;
        }
    };

    const invokeOnStackChangeListeners = () => {
        onStackChangeListeners.forEach((l) => {
            l(getHistory());
        });
    };

    const addOnStackChangeListener = (
        func: (p: PaintUndoInformation) => void,
    ) => {
        onStackChangeListeners.push(func);
    };

    const takeRegionSnapshot = (
        dt: PaintCordinate[],
        src?: string,
    ): Promise<PaintItemUndo> => {
        if (!src) {
            src = canvasRef.toDataURL(ENCODING_TYPE);
        }
        return new Promise((resolve, reject) => {
            const hidden_canv_src = document.createElement('canvas');
            hidden_canv_src.width = canvasRef.width;
            hidden_canv_src.height = canvasRef.height;
            const hidden_ctx_src = hidden_canv_src.getContext('2d');
            if (hidden_ctx_src) {
                const img = new Image();
                img.onload = () => {
                    hidden_ctx_src.clearRect(
                        0,
                        0,
                        canvasRef.width,
                        canvasRef.height,
                    );
                    hidden_ctx_src.drawImage(img, 0, 0);

                    const hidden_canv = document.createElement('canvas');
                    hidden_canv.style.display = 'none';
                    document.body.appendChild(hidden_canv);
                    hidden_canv.width = dt[1].x - dt[0].x;
                    hidden_canv.height = dt[1].y - dt[0].y;
                    const hidden_ctx = hidden_canv.getContext('2d');
                    if (hidden_ctx) {
                        hidden_ctx.drawImage(
                            hidden_canv_src,
                            dt[0].x,
                            dt[0].y,
                            dt[1].x - dt[0].x,
                            dt[1].y - dt[0].y,
                            0,
                            0,
                            dt[1].x - dt[0].x,
                            dt[1].y - dt[0].y,
                        );
                        const clippedCanvasDataUrl =
                            hidden_canv.toDataURL(ENCODING_TYPE);
                        hidden_canv.remove();
                        hidden_canv_src.remove();
                        resolve({
                            paintItem: {
                                dataUrl: clippedCanvasDataUrl,
                            },
                            deltaRegion: dt,
                        });
                    }
                };

                img.onerror = () => {
                    reject();
                };

                if (src) {
                    img.src = src;
                }
            }
        });
    };

    const loadToCanvas = (item: PaintItemUndo): Promise<void> => {
        return new Promise((resolve, reject) => {
            if (item?.paintItem?.dataUrl) {
                if (canvasContext) {
                    const img = new Image();
                    img.onload = () => {
                        canvasContext.globalCompositeOperation = 'source-over';
                        if (
                            item.deltaRegion &&
                            item.deltaRegion[0] &&
                            item.deltaRegion[1]
                        ) {
                            canvasContext.clearRect(
                                item.deltaRegion[0].x,
                                item.deltaRegion[0].y,
                                item.deltaRegion[1].x -
                                    item.deltaRegion[0].x -
                                    1,
                                item.deltaRegion[1].y -
                                    item.deltaRegion[0].y -
                                    1,
                            );
                            canvasContext.drawImage(
                                img,
                                item.deltaRegion[0].x,
                                item.deltaRegion[0].y,
                            );
                            resolve();
                        } else {
                            resolve();
                            throw 'failed to load due to lack of delta region.';
                        }
                    };
                    img.onerror = () => {
                        reject();
                    };
                    img.src = item.paintItem.dataUrl;
                }
            }
        });
    };

    const onMouseUp = () => {
        if (lastImage) {
            const nowImage = canvasContext.getImageData(
                0,
                0,
                canvasRef.width,
                canvasRef.height,
            );
            let minX = Number.MAX_VALUE;
            let minY = Number.MAX_VALUE;
            let maxX = Number.MIN_VALUE * -1;
            let maxY = Number.MIN_VALUE * -1;
            for (let i = 0; i < lastImage.data.length; i++) {
                if (lastImage.data[i] !== nowImage.data[i]) {
                    const x = (i / 4) % canvasRef.width;
                    const y = Math.floor(i / 4 / canvasRef.width);
                    minX = Math.min(x, minX);
                    minY = Math.min(y, minY);
                    maxX = Math.max(x, maxX);
                    maxY = Math.max(y, maxY);
                }
            }
            const deltaRegion = [
                {
                    x: minX,
                    y: minY,
                },
                {
                    x: maxX,
                    y: maxY,
                },
            ];

            const dtrpx0 = deltaRegion[0].x - PADDING;
            deltaRegion[0].x =
                dtrpx0 < 0 || dtrpx0 > canvasRef.width ? 0 : dtrpx0;
            const dtrpy0 = deltaRegion[0].y - PADDING;
            deltaRegion[0].y =
                dtrpy0 < 0 || dtrpy0 > canvasRef.height ? 0 : dtrpy0;
            const dtrpx1 = deltaRegion[1].x + PADDING;
            deltaRegion[1].x =
                dtrpx1 < 0 || dtrpx1 > canvasRef.width
                    ? canvasRef.width
                    : dtrpx1;
            const dtrpy1 = deltaRegion[1].y + PADDING;
            deltaRegion[1].y =
                dtrpy1 < 0 || dtrpy1 > canvasRef.height
                    ? canvasRef.height
                    : dtrpy1;
            if (undoRecord?.paintItem?.dataUrl !== undefined) {
                takeRegionSnapshot(
                    deltaRegion,
                    undoRecord.paintItem.dataUrl,
                ).then((undo) => {
                    undoStack.push(undo);
                    invokeOnStackChangeListeners();
                });
            }
        }
    };

    const onMouseDown = () => {
        lastImage = canvasContext.getImageData(
            0,
            0,
            canvasRef.width,
            canvasRef.height,
        );
        if (canvasRef) {
            const canvasDataURL = canvasRef.toDataURL(ENCODING_TYPE);
            undoRecord = {
                paintItem: {
                    dataUrl: canvasDataURL,
                },
                deltaRegion: [],
            };
        }
        redoStack = [];
        invokeOnStackChangeListeners();
    };

    const getHistory = (): PaintUndoInformation => {
        return {
            redos: redoStack,
            undos: undoStack,
        };
    };

    const setHistory = (paintInformation: PaintUndoInformation): void => {
        redoStack = paintInformation.redos;
        undoStack = paintInformation.undos;
    };

    const clearHistory = () => {
        redoStack = [];
        undoStack = [];
    };

    return {
        popLastUndo,
        popLastRedo,
        loadToCanvas,
        getHistory,
        setHistory,
        addOnStackChangeListener,
        paintHistoryHooks: {
            onMouseDown,
            onMouseUp,
        },
        clearHistory,
    };
};
