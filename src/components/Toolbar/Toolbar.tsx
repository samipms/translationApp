import { Stack } from '@fluentui/react';
import React, { useCallback, useContext, useEffect, useState } from 'react';

import { AutoSaveLabel } from '../AutoSaveLabel/AutoSaveLabel';
import { CanvasContext, ToolType } from '../CanvasContext/CanvasContext';
import { DialogsContext } from '../DialogsContext/DialogsContext';
import { Toolbutton } from '../ToolButton/Toolbutton';
import { Toolgroup } from '../Toolgroup/Toolgroup';
import styles from './Toolbar.module.scss';

export const Toolbar: React.FC = (): JSX.Element => {
    const canvasContext = useContext(CanvasContext);
    const dialogsContext = useContext(DialogsContext);
    const [isShowAutoSaveLabel, setIsShowAutoSaveLabel] = useState(false);
    const [isAutoSaveLabelInitialized, setIsShowAutoSaveLabelInitialized] =
        useState(false);
    useEffect(() => {
        if (
            canvasContext &&
            canvasContext.state.paintStorageManager &&
            !isAutoSaveLabelInitialized
        ) {
            canvasContext.state.paintStorageManager.addAutoSaveListener(() => {
                setIsShowAutoSaveLabel(true);
                setTimeout(() => {
                    setIsShowAutoSaveLabel(false);
                }, 2000);
            });
            setIsShowAutoSaveLabelInitialized(true);
        }
    }, [canvasContext, isAutoSaveLabelInitialized]);

    const onCopyLink = useCallback(() => {
        dialogsContext.dispatch &&
            dialogsContext.dispatch({ type: 'toggleCopyLinkDialog' });
    }, []);

    const onOpenClicked = async () => {
        dialogsContext.dispatch &&
            dialogsContext.dispatch({ type: 'toggleOpenDialog' });
    };

    const onEraseClicked = () => {
        dialogsContext.dispatch &&
            dialogsContext.dispatch({ type: 'toggleEraserOptionPane' });
        canvasContext.dispatch &&
            canvasContext.dispatch({
                type: 'setActiveTool',
                value: ToolType.Eraser,
            });
    };

    const onPaintClicked = () => {
        dialogsContext.dispatch &&
            dialogsContext.dispatch({ type: 'toggleBrushOptionPane' });
        canvasContext.dispatch &&
            canvasContext.dispatch({
                type: 'setActiveTool',
                value: ToolType.Brush,
            });
    };

    const onHighlighterClicked = () => {
        dialogsContext.dispatch &&
            dialogsContext.dispatch({ type: 'toggleHighlighterOptionPane' });
        canvasContext.dispatch &&
            canvasContext.dispatch({
                type: 'setActiveTool',
                value: ToolType.Highlighter,
            });
    };

    const onBucketClicked = () => {
        dialogsContext.dispatch &&
            dialogsContext.dispatch({ type: 'toggleBucketOptionPane' });
        canvasContext.dispatch &&
            canvasContext.dispatch({
                type: 'setActiveTool',
                value: ToolType.Fill,
            });
    };

    const onTextClicked = () => {
        dialogsContext.dispatch &&
            dialogsContext.dispatch({ type: 'toggleTextOptionPane' });
        canvasContext.dispatch &&
            canvasContext.dispatch({
                type: 'setActiveTool',
                value: ToolType.Text,
            });
    };

    const onLineClicked = () => {
        dialogsContext.dispatch &&
            dialogsContext.dispatch({ type: 'toggleShapeOptionPane' });
        canvasContext.dispatch &&
            canvasContext.dispatch({
                type: 'setActiveTool',
                value: ToolType.ShapeLine,
            });
    };

    const onRectangleClicked = () => {
        dialogsContext.dispatch &&
            dialogsContext.dispatch({ type: 'toggleShapeOptionPane' });
        canvasContext.dispatch &&
            canvasContext.dispatch({
                type: 'setActiveTool',
                value: ToolType.ShapeRectangle,
            });
    };

    const onCircleClicked = () => {
        dialogsContext.dispatch &&
            dialogsContext.dispatch({ type: 'toggleShapeOptionPane' });
        canvasContext.dispatch &&
            canvasContext.dispatch({
                type: 'setActiveTool',
                value: ToolType.ShapeCircle,
            });
    };

    const onArrowClicked = () => {
        dialogsContext.dispatch &&
            dialogsContext.dispatch({ type: 'toggleShapeOptionPane' });
        canvasContext.dispatch &&
            canvasContext.dispatch({
                type: 'setActiveTool',
                value: ToolType.ShapeArrow,
            });
    };

    const onSelectClicked = () => {
        dialogsContext.dispatch &&
            dialogsContext.dispatch({ type: 'dismissAll' });
        canvasContext.dispatch &&
            canvasContext.dispatch({
                type: 'setActiveTool',
                value: ToolType.Selection,
            });
    };

    const onZoomClicked = (isZoomIn: boolean) => {
        dialogsContext.dispatch &&
            dialogsContext.dispatch({ type: 'dismissAll' });
        canvasContext.dispatch &&
            canvasContext.dispatch({
                type: 'setActiveTool',
                value: isZoomIn ? ToolType.ZoomIn : ToolType.ZoomOut,
            });
    };

    const onUndo = () => {
        if (canvasContext.state.paintHistory) {
            canvasContext.state.paintHistory.popLastUndo();
        }
    };

    const onRedo = () => {
        if (canvasContext.state.paintHistory) {
            canvasContext.state.paintHistory.popLastRedo();
        }
    };

    const onNew = () => {
        if (canvasContext.state.context) {
            canvasContext.state.context.clearRect(0, 0, 2000, 1200);
        }
        if (canvasContext.state.paintStorageManager) {
            canvasContext.state.paintStorageManager.clearCurrentPaintItem();
        }
    };

    const onSaveClicked = () => {
        dialogsContext.dispatch &&
            dialogsContext.dispatch({ type: 'toggleSaveDialog' });
    };

    return (
        <div className={styles.topBar}>
            <Stack horizontal className={styles.toolbarContainer}>
                <Toolgroup width={100}>
                    <Toolbutton
                        iconName={'Add'}
                        onClick={onNew}
                        ariaLabel={'New file'}
                    />
                    <Toolbutton
                        iconName={'Save'}
                        onClick={onSaveClicked}
                        ariaLabel={'Save file'}
                    />
                    <Toolbutton
                        iconName={'OpenFolderHorizontal'}
                        onClick={onOpenClicked}
                        ariaLabel={'Open file'}
                    />
                    <div className={styles.loadingIconContainer}>
                        {isShowAutoSaveLabel && <AutoSaveLabel></AutoSaveLabel>}
                    </div>
                </Toolgroup>
                <div className={styles.centerContainer}>
                    <Toolgroup width={100}>
                        <Toolbutton
                            iconName={'Line'}
                            isActive={
                                canvasContext.state.activeTool ===
                                ToolType.ShapeLine
                            }
                            onClick={onLineClicked}
                            ariaLabel={'Line tool'}
                        />
                        <Toolbutton
                            iconName={'RectangleShape'}
                            isActive={
                                canvasContext.state.activeTool ===
                                ToolType.ShapeRectangle
                            }
                            onClick={onRectangleClicked}
                            ariaLabel={'Rectangle tool'}
                        />
                        <Toolbutton
                            iconName={'CircleRing'}
                            isActive={
                                canvasContext.state.activeTool ===
                                ToolType.ShapeCircle
                            }
                            onClick={onCircleClicked}
                            ariaLabel={'Circle tool'}
                        />
                        <Toolbutton
                            iconName={'ArrowTallUpRight'}
                            isActive={
                                canvasContext.state.activeTool ===
                                ToolType.ShapeArrow
                            }
                            onClick={onArrowClicked}
                            ariaLabel={'Arrow tool'}
                        />
                    </Toolgroup>
                    <Toolgroup width={120}>
                        <Toolbutton
                            iconName={'Brush'}
                            isActive={
                                canvasContext.state.activeTool ===
                                ToolType.Brush
                            }
                            onClick={onPaintClicked}
                            ariaLabel={'Brush tool'}
                        />
                        <Toolbutton
                            iconName={'Highlight'}
                            isActive={
                                canvasContext.state.activeTool ===
                                ToolType.Highlighter
                            }
                            onClick={onHighlighterClicked}
                            ariaLabel={'Highlight tool'}
                        />
                        <Toolbutton
                            iconName={'EraseTool'}
                            isActive={
                                canvasContext.state.activeTool ===
                                ToolType.Eraser
                            }
                            onClick={onEraseClicked}
                            ariaLabel={'Eraser tool'}
                        />
                        <Toolbutton
                            iconName={'BucketColor'}
                            isActive={
                                canvasContext.state.activeTool === ToolType.Fill
                            }
                            onClick={onBucketClicked}
                            ariaLabel={'Bucket tool'}
                        />
                        <Toolbutton
                            iconName={'PlainText'}
                            isActive={
                                canvasContext.state.activeTool === ToolType.Text
                            }
                            onClick={onTextClicked}
                            ariaLabel={'Text tool'}
                        />
                        <Toolbutton
                            iconName={'BorderDash'}
                            isActive={
                                canvasContext.state.activeTool ===
                                ToolType.Selection
                            }
                            onClick={onSelectClicked}
                            ariaLabel={'Selection tool'}
                        />
                    </Toolgroup>
                    <Toolgroup width={100}>
                        <Toolbutton
                            iconName={'ZoomOut'}
                            isActive={
                                canvasContext.state.activeTool ===
                                ToolType.ZoomOut
                            }
                            onClick={() => {
                                onZoomClicked(false);
                            }}
                            ariaLabel={'Zoom out tool'}
                        />
                        <Toolbutton
                            iconName={'ZoomIn'}
                            isActive={
                                canvasContext.state.activeTool ===
                                ToolType.ZoomIn
                            }
                            onClick={() => {
                                onZoomClicked(true);
                            }}
                            ariaLabel={'Zoom in tool'}
                        />
                        <Toolbutton
                            iconName={'Undo'}
                            onClick={onUndo}
                            ariaLabel={'Undo'}
                        />
                        <Toolbutton
                            iconName={'Redo'}
                            onClick={onRedo}
                            ariaLabel={'Redo'}
                        />
                    </Toolgroup>
                </div>
                <Toolgroup width={50}>
                    <Toolbutton
                        iconName={'Link'}
                        onClick={onCopyLink}
                        ariaLabel={'Copy link'}
                    />
                </Toolgroup>
            </Stack>
        </div>
    );
};
