import React, { useCallback, useReducer } from 'react';

import styles from './App.module.scss';
import { BrushOptionPane } from './BrushOptionPane/BrushOptionPane';
import { Canvas } from './Canvas/Canvas';
import {
    CanvasContext,
    CanvasReducer,
    initialCanvasState,
} from './CanvasContext/CanvasContext';
import { ColorPickerMenu } from './ColorPickerMenu/ColorPickerMenu';
import { CopyLinkDialog } from './CopyLinkDialog/CopyLinkDialog';
import {
    DialogsContext,
    DialogsReducer,
    initialDialogsState,
} from './DialogsContext/DialogsContext';
import { OpenDialog } from './OpenDialog/OpenDialog';
import { SaveDialog } from './SaveDialog/SaveDialog';
import { Toolbar } from './Toolbar/Toolbar';

// Main entrypoint to paint app
// Initialize all app state/contexts here
export const App = (): JSX.Element => {
    // States relating to paint canvas functionality
    const [canvasState, canvasDispatch] = useReducer(
        CanvasReducer,
        initialCanvasState,
    );
    // States relating to dialog/menu visibilities
    const [dialogsState, dialogsDispatch] = useReducer(
        DialogsReducer,
        initialDialogsState,
    );

    const dismissMenus = useCallback(
        (_event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
            dialogsDispatch({ type: 'dismissAll' });
        },
        [],
    );

    return (
        <DialogsContext.Provider
            value={{ state: dialogsState, dispatch: dialogsDispatch }}
        >
            <CanvasContext.Provider
                value={{ state: canvasState, dispatch: canvasDispatch }}
            >
                <div className={styles.app}>
                    <OpenDialog isVisible={dialogsState.isOpenDialogVisible} />
                    <SaveDialog isVisible={dialogsState.isSaveDialogVisible} />
                    <Toolbar />
                    <BrushOptionPane />
                    <ColorPickerMenu
                        isVisible={dialogsState.isColorPickerCalloutVisible}
                    />
                    <CopyLinkDialog
                        isVisible={dialogsState.isCopyLinkDialogVisible}
                    />
                    <div onMouseDown={dismissMenus}>
                        <Canvas />
                    </div>
                </div>
            </CanvasContext.Provider>
        </DialogsContext.Provider>
    );
};

export default App;
