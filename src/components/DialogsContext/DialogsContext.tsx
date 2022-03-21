import React from 'react';

export type DialogsContextType = {
    state: DialogsState;
    dispatch?: React.Dispatch<DialogsAction>;
};

export const initialDialogsState: DialogsState = {
    isBrushOptionPaneVisible: false,
    isBucketOptionPaneVisible: false,
    isHighlighterOptionPaneVisible: false,
    isEraserOptionPaneVisible: false,
    isShapeOptionPaneVisible: false,
    isColorPickerCalloutVisible: false,
    isSaveDialogVisible: false,
    isOpenDialogVisible: false,
    isTextOptionPaneVisible: false,
    isCopyLinkDialogVisible: false,
};

export const DialogsContext = React.createContext<DialogsContextType>({
    state: initialDialogsState,
});

export type DialogsState = {
    isBrushOptionPaneVisible: boolean;
    isHighlighterOptionPaneVisible: boolean;
    isEraserOptionPaneVisible: boolean;
    isShapeOptionPaneVisible: boolean;
    isBucketOptionPaneVisible: boolean;
    isColorPickerCalloutVisible: boolean;
    isSaveDialogVisible: boolean;
    isOpenDialogVisible: boolean;
    isTextOptionPaneVisible: boolean;
    isCopyLinkDialogVisible: boolean;
};

export type DialogsAction =
    | { type: 'dismissAll' }
    | { type: 'toggleBrushOptionPane' }
    | { type: 'toggleHighlighterOptionPane' }
    | { type: 'toggleEraserOptionPane' }
    | { type: 'toggleShapeOptionPane' }
    | { type: 'toggleBucketOptionPane' }
    | { type: 'toggleColorPicker' }
    | { type: 'toggleSaveDialog' }
    | { type: 'toggleOpenDialog' }
    | { type: 'toggleTextOptionPane' }
    | { type: 'toggleCopyLinkDialog' };

export const DialogsReducer = (
    state: DialogsState,
    action: DialogsAction,
): DialogsState => {
    // set all values to false
    const newState = { ...initialDialogsState };
    switch (action.type) {
        case 'dismissAll':
            return newState;
        case 'toggleBrushOptionPane':
            newState.isBrushOptionPaneVisible = !state.isBrushOptionPaneVisible;
            return newState;
        case 'toggleHighlighterOptionPane':
            newState.isHighlighterOptionPaneVisible =
                !state.isHighlighterOptionPaneVisible;
            return newState;
        case 'toggleEraserOptionPane':
            newState.isEraserOptionPaneVisible =
                !state.isEraserOptionPaneVisible;
            return newState;
        case 'toggleShapeOptionPane':
            newState.isShapeOptionPaneVisible =
                !state.isColorPickerCalloutVisible;
            return newState;
        case 'toggleBucketOptionPane':
            newState.isBucketOptionPaneVisible =
                !state.isBucketOptionPaneVisible;
            return newState;
        case 'toggleColorPicker':
            newState.isColorPickerCalloutVisible =
                !state.isColorPickerCalloutVisible;
            return newState;
        case 'toggleSaveDialog':
            newState.isSaveDialogVisible = !state.isSaveDialogVisible;
            return newState;
        case 'toggleOpenDialog':
            newState.isOpenDialogVisible = !state.isOpenDialogVisible;
            return newState;
        case 'toggleTextOptionPane':
            newState.isTextOptionPaneVisible = !state.isTextOptionPaneVisible;
            return newState;
        case 'toggleCopyLinkDialog':
            newState.isCopyLinkDialogVisible = !state.isCopyLinkDialogVisible;
            return newState;
        default:
            throw new Error('Invalid action type.');
    }
};
