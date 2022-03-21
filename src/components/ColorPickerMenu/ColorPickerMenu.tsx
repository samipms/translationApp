import {
    ColorPicker,
    getColorFromString,
    IColor,
    IColorCellProps,
    IColorPickerStyles,
    Stack,
    SwatchColorPicker,
} from '@fluentui/react';
import React, { FormEvent, useContext, useRef, useState } from 'react';

import { PaletteInformation } from '../../canvas-palette/canvas-palette';
import { CanvasContext } from '../CanvasContext/CanvasContext';
import styles from './ColorPickerMenu.module.scss';

type Props = {
    isVisible?: boolean;
};

export const ColorPickerMenu: React.FC<Props> = ({
    isVisible,
}): JSX.Element => {
    const { state, dispatch } = useContext(CanvasContext);
    const [recentColorCells, setRecentColorCells] = useState<IColorCellProps[]>(
        [],
    );
    const isSetRecentColorListener = useRef(false);

    const updateColor = React.useCallback(
        (_ev, colorObj: IColor) => {
            if (state.context) {
                dispatch &&
                    dispatch({ type: 'setActiveColor', value: colorObj });
            }
        },
        [dispatch, state.context],
    );

    const onRecentColorSwatchChange = (
        _event: FormEvent<HTMLElement>,
        _id: string | undefined,
        color: string | undefined,
    ) => {
        if (state.context && color) {
            const newColor = getColorFromString(color);
            if (newColor) {
                dispatch &&
                    dispatch({
                        type: 'setActiveColor',
                        value: newColor,
                    });
            }
        }
    };

    React.useEffect(() => {
        if (!isSetRecentColorListener.current && state.canvasPalette) {
            state.canvasPalette.addPaletteChangeListener(
                (palette: PaletteInformation) => {
                    setRecentColorCells([]);
                    setRecentColorCells(
                        palette.recentColors.map((c, i) => {
                            return {
                                color: '#' + c,
                                id: c,
                                index: i,
                            };
                        }),
                    );
                },
            );
            isSetRecentColorListener.current = true;
        }
    }, [state.canvasPalette]);

    return (
        <div className={styles.colorPickerRelativeContainer}>
            {isVisible && (
                <div className={styles.colorPickerContainer}>
                    <ColorPicker
                        color={state.activeColor}
                        onChange={updateColor}
                        alphaType={'none'}
                        styles={colorPickerStyles}
                        strings={{
                            hueAriaLabel: 'Hue',
                        }}
                    />
                    <Stack
                        className={styles.recentColorsSwatchContainer}
                        horizontal
                    >
                        <SwatchColorPicker
                            columnCount={5}
                            cellShape={'circle'}
                            colorCells={recentColorCells}
                            onChange={onRecentColorSwatchChange}
                        />
                    </Stack>
                </div>
            )}
        </div>
    );
};

const colorPickerStyles: Partial<IColorPickerStyles> = {
    panel: {
        padding: 12,
        backgroundColor: 'rgba(255, 255, 255, .15)',
        backdropFilter: 'blur(5px)',
    },
    root: {
        maxWidth: 352,
        minWidth: 352,
    },
    colorRectangle: { height: 268 },
};
