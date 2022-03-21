import _ from 'lodash';
import React, {
    useCallback,
    useContext,
    useEffect,
    useRef,
    useState,
} from 'react';

import { getCanvasPalette } from '../../canvas-palette/canvas-palette';
import { getPaintHistory } from '../../paint-history/get-paint-history';
import { getPaintStorageManager } from '../../paint-storage-manager/get-paint-storage-manager';
import { CanvasContext, ToolType } from '../CanvasContext/CanvasContext';
import { ImageEditor } from '../ImageEditor/ImageEditor';
import { MfsContext } from '../MfsContext/MfsContext';
import styles from './Canvas.module.scss';
import { getCanvasPointerClass } from './Canvas.styles';
import { Coordinate } from './Canvas.types';
import {
    drawArrow,
    drawEllipse,
    drawLine,
    drawRectangle,
    floodFill,
    getCoordinateForTextEndPosition,
    getCoordinateForTextStartPosition,
    getMouseCoordinate,
    isResizingTextArea,
} from './CanvasUtils';

export const Canvas: React.FC = (): JSX.Element => {
    const IMAGE_DRAG_SPEED_FACTOR = 0.6;
    // Determines canvas revolution, higher the number the more pixel density there is
    const CANVAS_RESOLUTION_FACTOR = 2;
    const DEFAULT_CANVAS_HEIGHT = 600;
    const DEFAULT_CANVAS_WIDTH = 1000;

    // Get Mfs and Canvas Context states
    const { state, dispatch } = useContext(CanvasContext);
    const { dataStore, graphClient } = useContext(MfsContext);

    // Init canvas refs
    // These variables will not cause a rerender
    const canvasRef = React.createRef<HTMLCanvasElement>();
    const canvasContainerRef = React.createRef<HTMLDivElement>();
    const [canvasContainerState, setCanvasContainerState] =
        React.useState<HTMLDivElement>();
    const imageRefPlot = React.createRef<HTMLImageElement>();
    const indicatorLayerRef = React.createRef<HTMLCanvasElement>();
    const indicatorLayerContext = React.useRef<CanvasRenderingContext2D>();
    const boundings = React.useRef<DOMRect>();
    const isDrawing = useRef(false);
    const isDraggingShape = useRef(false);
    const isPaintHistorySet = useRef(false);
    const isPaintStorageManagerSet = useRef(false);
    const isCanvasPaletteSet = useRef(false);
    const isSelectionStarted = useRef(false);

    const mousePos = React.useRef<Coordinate>({ x: 0, y: 0 });
    const typeStartPos = React.useRef<Coordinate>({ x: 0, y: 0 });
    const typeEndPos = React.useRef<Coordinate>({ x: 0, y: 0 });
    const shapeStartPos = React.useRef<Coordinate>({ x: 0, y: 0 });
    const selectionToolDimensions = React.useRef({
        x: 0,
        y: 0,
        w: 0,
        h: 0,
    });

    // Init canvas states
    // Changes in these variables will cause canvas to rerender
    const [canvasHeight, setCanvasHeight] = useState(
        DEFAULT_CANVAS_HEIGHT * CANVAS_RESOLUTION_FACTOR,
    );
    const [canvasWidth, setCanvasWidth] = useState(
        DEFAULT_CANVAS_WIDTH * CANVAS_RESOLUTION_FACTOR,
    );
    const [imageTop, setImageTop] = useState(0);
    const [imageLeft, setImageLeft] = useState(0);
    const [isMoving, setIsMoving] = useState(false);
    const [isResizing, setIsResizing] = useState(false);
    const [imageHeight, setImageHeight] = useState(0);
    const [imageWidth, setImageWidth] = useState(0);
    const [imageSrc, setImageSrc] = useState('');
    const [isImageEditing, setIsImageEditing] = useState(false);
    const [isDraggingTextArea, setIsDraggingTextArea] = useState(false);
    const [previousTextAreaSize, setPreviousTextAreaSize] = useState({
        width: 200,
        height: 100,
    });
    const [isSelectMenuVisible, setIsSelectMenuVisible] = useState(false);

    // Use Effect hooks

    // setup and initiation code
    useEffect(() => {
        if (canvasContainerRef.current) {
            setCanvasContainerState(canvasContainerRef.current);
        }
        if (dispatch) {
            const canvas = canvasRef.current;
            const canvasContext = canvas?.getContext('2d') ?? undefined;
            indicatorLayerContext.current =
                indicatorLayerRef.current?.getContext('2d') ?? undefined;
            dispatch({ type: 'setCanvasRef', value: canvas });
            dispatch({
                type: 'setContext',
                value: canvasContext,
            });
            if (canvasContext && canvas && !isPaintHistorySet.current) {
                const paintHistory = getPaintHistory(canvas, canvasContext);
                dispatch({
                    type: 'setPaintHistory',
                    value: paintHistory,
                });
                isPaintHistorySet.current = true;
                if (!isCanvasPaletteSet.current) {
                    const canvasPalette = getCanvasPalette();
                    dispatch({
                        type: 'setCanvasPalette',
                        value: canvasPalette,
                    });
                    isCanvasPaletteSet.current = true;

                    if (dataStore && graphClient && canvas) {
                        dispatch({
                            type: 'setPaintStorageManager',
                            value: getPaintStorageManager(
                                dataStore,
                                graphClient,
                                canvas,
                                paintHistory,
                                canvasPalette,
                            ),
                        });
                        isPaintStorageManagerSet.current = true;
                    }
                }
            }
            boundings.current = canvas?.getBoundingClientRect() ?? undefined;
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Code to run after crop (change to canvas size)
    useEffect(() => {
        if (imageRefPlot.current && state.context) {
            canvasRef.current
                ?.getContext('2d')
                ?.drawImage(
                    imageRefPlot.current,
                    0,
                    0,
                    imageWidth * CANVAS_RESOLUTION_FACTOR,
                    imageHeight * CANVAS_RESOLUTION_FACTOR,
                    0,
                    0,
                    imageWidth * CANVAS_RESOLUTION_FACTOR,
                    imageHeight * CANVAS_RESOLUTION_FACTOR,
                );
        }
        setIsImageEditing(false);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [canvasWidth, canvasHeight]);

    // Callbacks

    const showContextualMenu = React.useCallback(() => {
        setIsSelectMenuVisible(true);
    }, [setIsSelectMenuVisible]);

    const onCropCanvas = useCallback(() => {
        setImageTop(0);
        setImageLeft(0);
        setCanvasHeight(imageHeight * CANVAS_RESOLUTION_FACTOR);
        setCanvasWidth(imageWidth * CANVAS_RESOLUTION_FACTOR);
    }, [imageWidth, imageHeight]);

    const onImageEditingStateChange = useCallback((isImageEditing: boolean) => {
        setIsImageEditing(isImageEditing);
    }, []);

    const onSelectionMenuClicked = useCallback(
        (isVisible: boolean) => {
            setIsSelectMenuVisible(isVisible);
        },
        [setIsSelectMenuVisible],
    );

    const setImageDimensions = useCallback((width: number, height: number) => {
        setImageWidth(width / CANVAS_RESOLUTION_FACTOR);
        setImageHeight(height / CANVAS_RESOLUTION_FACTOR);
    }, []);

    const onResizeMouseMove = useCallback(
        (event: React.MouseEvent<Element, MouseEvent>) => {
            if (isResizing) {
                setImageWidth(imageWidth + event.movementX);
                setImageHeight(imageHeight + event.movementY);
            }
            event.stopPropagation();
        },
        [isResizing, imageWidth, imageHeight, setImageWidth, setImageHeight],
    );

    const onResizeMouseUp = useCallback(
        (event: React.MouseEvent<Element, MouseEvent>) => {
            setIsResizing(false);
            event.stopPropagation();
        },
        [setIsResizing],
    );

    const onImageEditorMouseMove = useCallback(
        (event: React.MouseEvent<Element, MouseEvent>) => {
            if (isMoving) {
                setImageTop(
                    imageTop + event.movementY * IMAGE_DRAG_SPEED_FACTOR,
                );
                setImageLeft(
                    imageLeft + event.movementX * IMAGE_DRAG_SPEED_FACTOR,
                );
                selectionToolDimensions.current.y =
                    (imageTop + event.movementY * IMAGE_DRAG_SPEED_FACTOR) *
                    CANVAS_RESOLUTION_FACTOR;
                selectionToolDimensions.current.x =
                    (imageLeft + event.movementX * IMAGE_DRAG_SPEED_FACTOR) *
                    CANVAS_RESOLUTION_FACTOR;
            }
            if (isResizing) {
                onResizeMouseMove(event);
            }
            event.stopPropagation();
        },
        [imageLeft, imageTop, isMoving, isResizing, onResizeMouseMove],
    );

    const onImageEditorMouseUp = useCallback(
        (event: React.MouseEvent<Element, MouseEvent>) => {
            setIsMoving(false);
            if (isResizing) {
                onResizeMouseUp(event);
            }
            setIsSelectMenuVisible(true);
            event.stopPropagation();
        },
        [isResizing, onResizeMouseUp],
    );

    const onTextAreaMouseDown = useCallback(() => {
        setIsDraggingTextArea(true);
    }, [setIsDraggingTextArea]);

    const onTextAreaMouseUp = useCallback(() => {
        setIsDraggingTextArea(false);
    }, [setIsDraggingTextArea]);

    const onTextAreaInputChange = useCallback(() => {
        const inputTextFieldDOM = document.getElementById(
            'input-textfield',
        ) as HTMLTextAreaElement;
        inputTextFieldDOM.style.fontFamily = 'Arial';
        inputTextFieldDOM.style.fontSize = `${
            state.textSize / CANVAS_RESOLUTION_FACTOR
        }px`;
        inputTextFieldDOM.style.color = `#${state.textColor.hex}`;
    }, [state.textColor.hex, state.textSize]);

    const onTextAreaMove = useCallback(
        (event: React.MouseEvent<HTMLTextAreaElement, MouseEvent>) => {
            const inputTextFieldDOM = document.getElementById(
                'input-textfield',
            ) as HTMLTextAreaElement;
            if (isResizingTextArea(inputTextFieldDOM, previousTextAreaSize)) {
                setPreviousTextAreaSize({
                    width: inputTextFieldDOM.offsetWidth,
                    height: inputTextFieldDOM.offsetHeight,
                });
                setIsDraggingTextArea(false);
            } else if (isDraggingTextArea) {
                typeStartPos.current = getCoordinateForTextStartPosition(
                    event,
                    boundings.current,
                    state.zoomPercentage,
                    canvasContainerState.scrollTop,
                    canvasContainerState.scrollLeft,
                    inputTextFieldDOM,
                );
                typeEndPos.current = getCoordinateForTextEndPosition(
                    event,
                    boundings.current,
                    state.textSize,
                    state.zoomPercentage,
                    canvasContainerState.scrollTop,
                    canvasContainerState.scrollLeft,
                    inputTextFieldDOM,
                );
                inputTextFieldDOM.style.left = `${typeStartPos.current.x}px`;
                inputTextFieldDOM.style.top = `${typeStartPos.current.y}px`;
            }
        },
        [
            previousTextAreaSize,
            isDraggingTextArea,
            state.zoomPercentage,
            state.textSize,
            canvasContainerState,
        ],
    );

    const onMouseDown = useCallback(
        (event: React.MouseEvent<HTMLCanvasElement, MouseEvent>) => {
            if (!boundings.current || !state.context || !canvasContainerState) {
                return;
            }
            if (state.paintHistory) {
                state.paintHistory.paintHistoryHooks.onMouseDown();
            }
            // When user clicks outside of selection zone, paste image back into canvas
            if (isImageEditing && imageRefPlot.current) {
                state.context.drawImage(
                    imageRefPlot.current,
                    0, // source image x
                    0, // source image y
                    selectionToolDimensions.current.w, // source image w
                    selectionToolDimensions.current.h, // source image h
                    imageLeft * CANVAS_RESOLUTION_FACTOR, // canvas x
                    imageTop * CANVAS_RESOLUTION_FACTOR, // canvas x
                    imageWidth * CANVAS_RESOLUTION_FACTOR, // canvas w
                    imageHeight * CANVAS_RESOLUTION_FACTOR, // canvas h
                );
                setImageSrc('');
                return;
            }

            if (state.activeTool !== ToolType.Text) {
                const inputTextFieldDOM = document.getElementById(
                    'input-textfield',
                ) as HTMLTextAreaElement;
                inputTextFieldDOM.style.display = 'none';
            }

            if (state.activeTool === ToolType.Brush) {
                isDrawing.current = true;
                state.context.beginPath();
                state.context.moveTo(mousePos.current[0], mousePos.current[1]);
                state.context.lineCap = 'round';
                state.context.strokeStyle = state.brushColor.str;
                state.context.lineWidth = state.brushSize;
                state.context.globalCompositeOperation = 'source-over';
                // draw a dot with a line that starts and ends at mousePos
                // this is needed if the user does not move their mouse after mouseDown
                drawLine(state.context, mousePos.current, mousePos.current);
            } else if (state.activeTool === ToolType.Highlighter) {
                isDrawing.current = true;
                state.context.beginPath();
                state.context.moveTo(mousePos.current[0], mousePos.current[1]);
                state.context.lineCap = 'square';
                state.context.lineWidth = state.highlighterSize;
                state.context.globalCompositeOperation = 'multiply';
                state.context.strokeStyle = '#ff0';
            } else if (state.activeTool === ToolType.Eraser) {
                isDrawing.current = true;
                state.context.beginPath();
                state.context.moveTo(mousePos.current[0], mousePos.current[1]);
                state.context.lineCap = 'square';
                state.context.lineWidth = state.eraserSize;
                state.context.globalCompositeOperation = 'destination-out';
            } else if (state.activeTool === ToolType.Fill) {
                floodFill(
                    getMouseCoordinate(
                        event,
                        boundings.current,
                        state.zoomPercentage,
                        canvasContainerState.scrollTop,
                        canvasContainerState.scrollLeft,
                    ),
                    state.context,
                    canvasWidth,
                    canvasHeight,
                    state.fillColor,
                );
            } else if (
                state.activeTool === ToolType.ShapeLine ||
                state.activeTool === ToolType.ShapeCircle ||
                state.activeTool === ToolType.ShapeRectangle ||
                state.activeTool === ToolType.ShapeArrow
            ) {
                state.context.globalCompositeOperation = 'source-over';
                shapeStartPos.current = mousePos.current;
                isDraggingShape.current = true;
            } else if (state.activeTool === ToolType.Text) {
                const inputTextFieldDOM = document.getElementById(
                    'input-textfield',
                ) as HTMLTextAreaElement;
                if (inputTextFieldDOM) {
                    if (inputTextFieldDOM.value === '') {
                        typeStartPos.current =
                            getCoordinateForTextStartPosition(
                                event,
                                boundings.current,
                                state.zoomPercentage,
                                canvasContainerState.scrollTop,
                                canvasContainerState.scrollLeft,
                                inputTextFieldDOM,
                            );

                        typeEndPos.current = getCoordinateForTextEndPosition(
                            event,
                            boundings.current,
                            state.textSize,
                            state.zoomPercentage,
                            canvasContainerState.scrollTop,
                            canvasContainerState.scrollLeft,
                            inputTextFieldDOM,
                        );

                        inputTextFieldDOM.style.display = 'inline';
                        inputTextFieldDOM.style.left = `${typeStartPos.current.x}px`;
                        inputTextFieldDOM.style.top = `${typeStartPos.current.y}px`;
                        inputTextFieldDOM.style.fontFamily = 'Arial';
                        inputTextFieldDOM.style.fontSize = `${
                            state.textSize / CANVAS_RESOLUTION_FACTOR
                        }px`;
                        inputTextFieldDOM.style.color = `#${state.textColor.hex}`;
                    } else {
                        // take care of linebreaks
                        const textArray =
                            inputTextFieldDOM.value.split(/\n\r?/g);

                        state.context.font = `${state.textSize}px Arial`;
                        state.context.fillStyle = `#${state.textColor.hex}`;
                        _.forEach(textArray, (r, index) => {
                            state.context.fillText(
                                r,
                                typeEndPos.current.x,
                                typeEndPos.current.y + index * state.textSize,
                            );
                        });

                        inputTextFieldDOM.style.display = 'none';
                    }
                }
                inputTextFieldDOM.value = '';
            } else if (state.activeTool === ToolType.Selection) {
                selectionToolDimensions.current = { x: 0, y: 0, w: 0, h: 0 };
                isSelectionStarted.current = true;
                const coords = getMouseCoordinate(
                    event,
                    boundings.current,
                    state.zoomPercentage,
                    canvasContainerState.scrollTop,
                    canvasContainerState.scrollLeft,
                );
                selectionToolDimensions.current.x = coords.x;
                selectionToolDimensions.current.y = coords.y;
            } else if (
                state.activeTool === ToolType.ZoomIn ||
                state.activeTool === ToolType.ZoomOut
            ) {
                const getZoomPercentage = (isZoomIn: boolean) => {
                    return isZoomIn
                        ? state.zoomPercentage + 10
                        : state.zoomPercentage === 100
                        ? 100
                        : state.zoomPercentage - 10;
                };
                if (state.activeTool === ToolType.ZoomIn && dispatch) {
                    dispatch({
                        type: 'setZoomPercentage',
                        value: getZoomPercentage(true),
                    });
                } else if (state.activeTool === ToolType.ZoomOut && dispatch) {
                    dispatch({
                        type: 'setZoomPercentage',
                        value: getZoomPercentage(false),
                    });
                }
            }
        },
        [
            state,
            canvasContainerState,
            isImageEditing,
            imageRefPlot,
            imageLeft,
            imageTop,
            imageWidth,
            imageHeight,
            canvasHeight,
            canvasWidth,
            dispatch,
        ],
    );

    const onMouseMove = useCallback(
        (event: React.MouseEvent<Element, MouseEvent>) => {
            // Get new mouse position
            if (boundings.current && canvasContainerState && state) {
                mousePos.current = getMouseCoordinate(
                    event,
                    boundings.current,
                    state.zoomPercentage,
                    canvasContainerState.scrollTop,
                    canvasContainerState.scrollLeft,
                );
            }

            if (isMoving) {
                onImageEditorMouseMove(event);
            }
            if (isResizing) {
                onResizeMouseMove(event);
            }

            // Handle drawing
            if (state.context) {
                if (isDrawing.current === true) {
                    state.context.lineTo(
                        mousePos.current.x,
                        mousePos.current.y,
                    );
                    state.context.stroke();
                }
            }

            // Show tool sizes on indication layer
            if (indicatorLayerContext.current) {
                // Text tool
                if (state.activeTool !== ToolType.Text) {
                    indicatorLayerContext.current.clearRect(
                        0,
                        0,
                        canvasWidth,
                        canvasHeight,
                    );
                }
                // Shape tool
                if (isDraggingShape.current === true) {
                    indicatorLayerContext.current.strokeStyle =
                        state.shapeColor.str;
                    indicatorLayerContext.current.lineWidth = state.shapeSize;
                    if (state.activeTool === ToolType.ShapeLine) {
                        drawLine(
                            indicatorLayerContext.current,
                            shapeStartPos.current,
                            mousePos.current,
                        );
                    } else if (state.activeTool === ToolType.ShapeRectangle) {
                        drawRectangle(
                            indicatorLayerContext.current,
                            shapeStartPos.current,
                            mousePos.current,
                        );
                    } else if (state.activeTool === ToolType.ShapeCircle) {
                        drawEllipse(
                            indicatorLayerContext.current,
                            shapeStartPos.current.x,
                            shapeStartPos.current.y,
                            mousePos.current.x - shapeStartPos.current.x,
                            mousePos.current.y - shapeStartPos.current.y,
                        );
                    } else if (state.activeTool === ToolType.ShapeArrow) {
                        drawArrow(
                            indicatorLayerContext.current,
                            shapeStartPos.current,
                            mousePos.current,
                            30 + state.shapeSize / CANVAS_RESOLUTION_FACTOR,
                        );
                    }
                }

                // Brush tool
                if (state.activeTool === ToolType.Brush) {
                    indicatorLayerContext.current.fillStyle =
                        state.brushColor.str;
                    indicatorLayerContext.current.beginPath();
                    indicatorLayerContext.current.arc(
                        mousePos.current.x,
                        mousePos.current.y,
                        // start from center, brush diameter / 2
                        state.brushSize / 2,
                        0,
                        2 * Math.PI,
                        false,
                    );
                    indicatorLayerContext.current.fill();
                }

                // Eraser tool
                if (state.activeTool === ToolType.Eraser) {
                    indicatorLayerContext.current.fillStyle =
                        'rgba(255, 255, 255, 1)';
                    indicatorLayerContext.current.strokeStyle =
                        'rgba(0, 0, 0, 0.4)';
                    indicatorLayerContext.current.beginPath();
                    // start from center, eraser diameter / 2
                    indicatorLayerContext.current.rect(
                        mousePos.current.x - state.eraserSize / 2,
                        mousePos.current.y - state.eraserSize / 2,
                        state.eraserSize,
                        state.eraserSize,
                    );
                    indicatorLayerContext.current.fill();
                    indicatorLayerContext.current.stroke();
                }
                if (state.activeTool === ToolType.Selection) {
                    if (
                        !isMoving &&
                        !isResizing &&
                        isSelectionStarted.current
                    ) {
                        const coords = mousePos.current;
                        selectionToolDimensions.current = {
                            w: Math.abs(
                                coords.x - selectionToolDimensions.current.x,
                            ),
                            h: Math.abs(
                                coords.y - selectionToolDimensions.current.y,
                            ),
                            x: Math.min(
                                coords.x,
                                selectionToolDimensions.current.x,
                            ),
                            y: Math.min(
                                coords.y,
                                selectionToolDimensions.current.y,
                            ),
                        };

                        const ctx =
                            indicatorLayerRef?.current?.getContext('2d');
                        if (ctx) {
                            ctx.clearRect(0, 0, canvasWidth, canvasHeight);
                            ctx.setLineDash([6]);
                            ctx.strokeRect(
                                selectionToolDimensions.current.x,
                                selectionToolDimensions.current.y,
                                selectionToolDimensions.current.w,
                                selectionToolDimensions.current.h,
                            );
                        }
                    }
                }
            }
        },
        [
            canvasContainerState,
            state,
            isMoving,
            isResizing,
            onImageEditorMouseMove,
            onResizeMouseMove,
            indicatorLayerRef,
            canvasWidth,
            canvasHeight,
        ],
    );

    const onMouseUp = useCallback(
        (event: React.MouseEvent<HTMLElement, MouseEvent>) => {
            isDrawing.current = false;
            isDraggingShape.current = false;

            if (isMoving) {
                onImageEditorMouseUp(event);
            }

            if (isResizing) {
                onResizeMouseUp(event);
            }

            if (!isMoving && !isResizing && isImageEditing) {
                setIsImageEditing(false);
                return;
            }

            if (state.context) {
                if (state.activeTool === ToolType.ShapeLine) {
                    state.context.strokeStyle = state.shapeColor.str;
                    state.context.lineWidth = state.shapeSize;
                    drawLine(
                        state.context,
                        shapeStartPos.current,
                        mousePos.current,
                    );
                } else if (state.activeTool === ToolType.ShapeRectangle) {
                    state.context.strokeStyle = state.shapeColor.str;
                    state.context.lineWidth = state.shapeSize;
                    drawRectangle(
                        state.context,
                        shapeStartPos.current,
                        mousePos.current,
                    );
                } else if (state.activeTool === ToolType.ShapeCircle) {
                    state.context.strokeStyle = state.shapeColor.str;
                    state.context.lineWidth = state.shapeSize;
                    drawEllipse(
                        state.context,
                        shapeStartPos.current.x,
                        shapeStartPos.current.y,
                        mousePos.current.x - shapeStartPos.current.x,
                        mousePos.current.y - shapeStartPos.current.y,
                    );
                } else if (state.activeTool === ToolType.ShapeArrow) {
                    state.context.strokeStyle = state.shapeColor.str;
                    state.context.lineWidth = state.shapeSize;
                    drawArrow(
                        state.context,
                        shapeStartPos.current,
                        mousePos.current,
                        30 + state.shapeSize / 2,
                    );
                }
                if (state.activeTool === ToolType.Selection) {
                    isSelectionStarted.current = false;
                    if (
                        !isMoving &&
                        !isResizing &&
                        canvasRef.current &&
                        selectionToolDimensions.current &&
                        indicatorLayerRef.current
                    ) {
                        indicatorLayerRef.current.width =
                            selectionToolDimensions.current.w;
                        indicatorLayerRef.current.height =
                            selectionToolDimensions.current.h;
                        const indicatorCtx =
                            indicatorLayerRef.current.getContext('2d');
                        if (indicatorCtx) {
                            indicatorCtx.clearRect(
                                0,
                                0,
                                canvasWidth,
                                canvasHeight,
                            );
                            indicatorCtx.drawImage(
                                canvasRef.current,
                                selectionToolDimensions.current.x,
                                selectionToolDimensions.current.y,
                                selectionToolDimensions.current.w *
                                    CANVAS_RESOLUTION_FACTOR,
                                selectionToolDimensions.current.h *
                                    CANVAS_RESOLUTION_FACTOR,
                                0,
                                0,
                                selectionToolDimensions.current.w *
                                    CANVAS_RESOLUTION_FACTOR,
                                selectionToolDimensions.current.h *
                                    CANVAS_RESOLUTION_FACTOR,
                            );

                            const canvasImageUrl =
                                indicatorLayerRef.current.toDataURL(
                                    'image/png',
                                );
                            indicatorCtx.clearRect(
                                0,
                                0,
                                canvasWidth,
                                canvasHeight,
                            );
                            canvasRef.current
                                .getContext('2d')
                                ?.clearRect(
                                    selectionToolDimensions.current.x,
                                    selectionToolDimensions.current.y,
                                    selectionToolDimensions.current.w,
                                    selectionToolDimensions.current.h,
                                );

                            setImageTop(
                                selectionToolDimensions.current.y /
                                    CANVAS_RESOLUTION_FACTOR,
                            );
                            setImageLeft(
                                selectionToolDimensions.current.x /
                                    CANVAS_RESOLUTION_FACTOR,
                            );
                            setImageDimensions(
                                selectionToolDimensions.current.w,
                                selectionToolDimensions.current.h,
                            );
                            setImageSrc(canvasImageUrl);
                            setIsImageEditing(true);
                        }
                        indicatorLayerRef.current.width = canvasWidth;
                        indicatorLayerRef.current.height = canvasHeight;
                        showContextualMenu();
                    }
                }

                if (state.paintHistory) {
                    state.paintHistory.paintHistoryHooks.onMouseUp();
                }

                if (state && state.canvasPalette) {
                    state.canvasPalette.addRecentColor(state.brushColor.hex);
                    state.canvasPalette.addRecentBrushSize(state.brushSize);
                }

                if (
                    state.paintStorageManager &&
                    state.canvasPalette &&
                    state.paintHistory
                ) {
                    state.paintStorageManager.runAutoSave();
                }
            }

            if (!boundings.current || !state.context) {
                return;
            }
        },
        [
            isMoving,
            isResizing,
            isImageEditing,
            state,
            onImageEditorMouseUp,
            onResizeMouseUp,
            canvasRef,
            indicatorLayerRef,
            canvasWidth,
            canvasHeight,
            showContextualMenu,
            setImageDimensions,
        ],
    );

    const onMouseOut = useCallback(
        (_event: React.MouseEvent<HTMLCanvasElement, MouseEvent>) => {
            isDrawing.current = false;
            if (state.paintHistory) {
                state.paintHistory.paintHistoryHooks.onMouseUp();
            }
        },
        [state, isDrawing],
    );

    const onImageDrop = useCallback(
        (event: React.DragEvent<HTMLCanvasElement>) => {
            setImageTop(0);
            setImageLeft(0);
            event.preventDefault();
            const blob = event.dataTransfer.files[0];
            const reader = new FileReader();
            reader.onload = function (event) {
                if (event.target) {
                    setImageSrc(event.target.result as string);
                    setIsImageEditing(true);
                }
            };
            reader.readAsDataURL(blob);
        },
        [setImageSrc, setIsImageEditing],
    );

    const onDragOverCanvas = (event: React.DragEvent<HTMLCanvasElement>) => {
        event.preventDefault();
    };

    const onKeyPress = (event: KeyboardEvent) => {
        if (
            !boundings.current ||
            !state.context ||
            state.activeTool !== ToolType.Text
        ) {
            return;
        }

        // match char only, no SHIFT, BACKSPACE.. etc.   )
        if (
            event.keyCode === 37 ||
            event.keyCode === 39 ||
            event.keyCode === 16 ||
            event.keyCode === 8 ||
            event.keyCode === 13 ||
            event.ctrlKey ||
            event.metaKey ||
            event.altKey
        ) {
            return;
        }
    };

    const onPaste = (event: ClipboardEvent) => {
        setImageTop(0);
        setImageLeft(0);
        if (state.context) {
            if (!event) {
                return;
            }
            const items = event.clipboardData.items;
            for (const index in items) {
                const item = items[index];
                if (item.kind === 'file') {
                    const blob = item.getAsFile();
                    const img = new Image();
                    img.src = URL.createObjectURL(blob);
                    img.onload = () => {
                        setImageSrc(img.src);
                        selectionToolDimensions.current.x = 0;
                        selectionToolDimensions.current.y = 0;
                        selectionToolDimensions.current.w = img.width;
                        selectionToolDimensions.current.h = img.height;
                        setImageDimensions(img.width, img.height);
                        setIsImageEditing(true);
                    };
                }
            }
        }
    };

    document.onpaste = onPaste;
    window.onkeydown = onKeyPress;

    // Indication layer used for drawing tool sizes
    // paint-canvas is used for the actual canvas drawing
    return (
        <div className={styles.canvasFlexContainer} ref={canvasContainerRef}>
            <div
                style={{
                    zoom: state ? `${state.zoomPercentage}%` : '100%',
                }}
            >
                <div
                    className={styles.canvasContainer}
                    style={{
                        height: canvasHeight / CANVAS_RESOLUTION_FACTOR,
                        width: canvasWidth / CANVAS_RESOLUTION_FACTOR,
                    }}
                >
                    <ImageEditor
                        imageLeft={imageLeft}
                        imageTop={imageTop}
                        imageSrc={imageSrc}
                        setIsMoving={setIsMoving}
                        setIsResizing={setIsResizing}
                        width={imageWidth}
                        height={imageHeight}
                        onImageMouseMove={onImageEditorMouseMove}
                        onImageMouseUp={onImageEditorMouseUp}
                        onResizeMouseMove={onResizeMouseMove}
                        onResizeMouseUp={onResizeMouseUp}
                        onCropCanvas={onCropCanvas}
                        isImageEditing={isImageEditing}
                        imageRefPlot={imageRefPlot}
                        onImageEditingStateChange={onImageEditingStateChange}
                        isSelectMenuVisible={isSelectMenuVisible}
                        selectMenuTop={
                            selectionToolDimensions.current.y /
                            CANVAS_RESOLUTION_FACTOR
                        }
                        selectMenuLeft={
                            selectionToolDimensions.current.x /
                                CANVAS_RESOLUTION_FACTOR +
                            imageWidth +
                            // spacing so there's no overlap
                            4
                        }
                        onSelectionMenuClicked={onSelectionMenuClicked}
                        setImageDimensions={setImageDimensions}
                    />
                    <textarea
                        className={styles.input}
                        id="input-textfield"
                        onMouseUp={onTextAreaMouseUp}
                        onMouseDown={onTextAreaMouseDown}
                        onMouseMove={onTextAreaMove}
                        onInput={onTextAreaInputChange}
                        onFocus={onTextAreaInputChange}
                    />
                    <canvas
                        id="indicatorLayer"
                        style={{
                            width: canvasWidth / CANVAS_RESOLUTION_FACTOR,
                            height: canvasHeight / CANVAS_RESOLUTION_FACTOR,
                        }}
                        width={canvasWidth}
                        height={canvasHeight}
                        ref={indicatorLayerRef}
                        className={`${
                            styles.indicatorLayer
                        } ${getCanvasPointerClass(state.activeTool)}`}
                        onMouseDown={onMouseDown}
                        onMouseMove={onMouseMove}
                        onBlur={() => {
                            return;
                        }}
                        onMouseUp={onMouseUp}
                        onMouseOut={onMouseOut}
                        onDragOver={onDragOverCanvas}
                        onDragEnter={onDragOverCanvas}
                        onDragLeave={onDragOverCanvas}
                        onDrop={onImageDrop}
                    />
                    <canvas
                        id="paint-canvas"
                        style={{
                            width: canvasWidth / CANVAS_RESOLUTION_FACTOR,
                            height: canvasHeight / CANVAS_RESOLUTION_FACTOR,
                        }}
                        width={canvasWidth}
                        height={canvasHeight}
                        className={styles.canvas}
                        ref={canvasRef}
                    />
                </div>
            </div>
        </div>
    );
};
