import { DefaultButton, Modal, Stack } from '@fluentui/react';
import React, { useContext, useEffect, useState } from 'react';

import { PaintItem } from '../../mfs/paintData';
import { PaintUndoInformation } from '../../paint-history/get-paint-history';
import { CanvasContext } from '../CanvasContext/CanvasContext';
import { DialogsContext } from '../DialogsContext/DialogsContext';
import styles from './OpenDialog.module.scss';

type Props = {
    isVisible: boolean;
};

export const OpenDialog: React.FC<Props> = ({ isVisible }): JSX.Element => {
    const { state } = useContext(CanvasContext);
    const dialogsContext = useContext(DialogsContext);
    const canvasContext = useContext(CanvasContext);
    const [selectedFile, setSelectedFile] = useState<PaintItem | null>(null);
    const [displayedPaintItems, setDisplayedPaintItems] =
        useState<PaintItem[]>();

    useEffect(() => {
        const getAllItems = async () => {
            if (
                canvasContext.state.paintStorageManager &&
                canvasContext.state.canvasPalette &&
                canvasContext.state.paintHistory
            ) {
                const items =
                    await canvasContext.state.paintStorageManager.getAllItems();
                setDisplayedPaintItems(items);
            }
        };
        if (isVisible && displayedPaintItems === undefined) {
            getAllItems();
        }
    }, [displayedPaintItems, isVisible]);

    useEffect(() => {
        setSelectedFile(
            displayedPaintItems && displayedPaintItems.length > 0
                ? displayedPaintItems[0]
                : null,
        );
    }, [displayedPaintItems]);

    const onClickImage = (item: PaintItem) => {
        setSelectedFile(item);
    };

    const onDeleteImage = (item: PaintItem) => {
        if (state.paintStorageManager && item.id) {
            state.paintStorageManager.runDeletePaintItem(item);
            setDisplayedPaintItems(
                displayedPaintItems.filter((value) => {
                    return value.id !== item.id;
                }),
            );
            setSelectedFile(
                displayedPaintItems && displayedPaintItems.length > 0
                    ? displayedPaintItems[0]
                    : null,
            );
        }
    };

    const onLoadImageCallback = (item: PaintItem) => {
        if (item.dataUrl) {
            const img = new Image();
            img.onload = function () {
                if (state.context) {
                    const previousGlobalCompositionOperation =
                        state.context.globalCompositeOperation;
                    state.context.globalCompositeOperation = 'source-over';
                    //draw background image
                    state.context.clearRect(0, 0, 2000, 1200);
                    state.context.drawImage(img, 0, 0);
                    state.context.globalCompositeOperation =
                        previousGlobalCompositionOperation;
                    if (state.paintHistory) {
                        if (item.paintUndoInformationJsonString) {
                            const paintInfo: PaintUndoInformation = JSON.parse(
                                item.paintUndoInformationJsonString,
                            );
                            state.paintHistory.setHistory(paintInfo);
                        }
                    }
                    if (state.canvasPalette) {
                        if (item.canvasPaletteInformationJsonString) {
                            const json = JSON.parse(
                                item.canvasPaletteInformationJsonString,
                            );
                            state.canvasPalette.setPaletteInformation(json);
                        } else {
                            state.canvasPalette.setPaletteInformation();
                        }
                    }
                }
            };
            img.src = item.dataUrl;
        }
        if (isVisible) {
            dialogsContext.dispatch &&
                dialogsContext.dispatch({ type: 'toggleOpenDialog' });
        }
        if (state.paintStorageManager) {
            state.paintStorageManager.changeCurrentPaintItem(item);
        }
    };

    const onLoadImage = (item: PaintItem) => {
        canvasContext.state.paintStorageManager.getAnItem(
            item.id,
            onLoadImageCallback,
        );
    };

    const onDismiss = () => {
        if (isVisible) {
            dialogsContext.dispatch &&
                dialogsContext.dispatch({ type: 'toggleOpenDialog' });
            setDisplayedPaintItems(undefined);
        }
    };

    return (
        <Modal
            isOpen={isVisible && state.paintStorageManager !== undefined}
            onDismiss={onDismiss}
            isBlocking={false}
            className={styles.modalStyles}
            containerClassName={styles.modalContainer}
            scrollableContentClassName={styles.scrollableContentClassName}
        >
            <Stack horizontalAlign={'center'} className={styles.modalContainer}>
                {selectedFile && (
                    <Stack
                        verticalAlign={'center'}
                        horizontalAlign={'center'}
                        className={styles.paintItemViewerContainer}
                    >
                        <img
                            height={'100%'}
                            alt={selectedFile.name}
                            src={selectedFile.thumbnail}
                            aria-label={'Selected image'}
                        />
                        <Stack
                            horizontalAlign={'center'}
                            className={styles.paintItemViewerControlContainer}
                        >
                            <h2 className={styles.paintItemTitle}>
                                {selectedFile.name ? selectedFile.name : ''}
                            </h2>
                            <Stack horizontal>
                                <DefaultButton
                                    className={styles.actionButton}
                                    onClick={() => {
                                        onLoadImage(selectedFile);
                                    }}
                                    ariaLabel={'Open'}
                                >
                                    Open
                                </DefaultButton>
                                <DefaultButton
                                    className={styles.actionButton}
                                    onClick={() => {
                                        onDeleteImage(selectedFile);
                                    }}
                                    ariaLabel={'Delete'}
                                >
                                    Delete
                                </DefaultButton>
                            </Stack>
                        </Stack>
                    </Stack>
                )}
                <div className={styles.paintItemExplorerContainer}>
                    {displayedPaintItems &&
                        displayedPaintItems.map((item, key) => {
                            return (
                                <DefaultButton
                                    key={key}
                                    onClick={() => {
                                        onClickImage(item);
                                    }}
                                    className={styles.paintItemButton}
                                >
                                    <img
                                        width={'100px'}
                                        alt={item.name}
                                        src={item.thumbnail}
                                    />
                                </DefaultButton>
                            );
                        })}
                </div>
            </Stack>
        </Modal>
    );
};
