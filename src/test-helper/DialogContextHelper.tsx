import React, { useReducer } from 'react';

import {
    DialogsContext,
    DialogsReducer,
    DialogsState,
} from '../components/DialogsContext/DialogsContext';

type DialogContextHelperProps = {
    initialState: DialogsState;
};

export const DialogContextHelper: React.FC<DialogContextHelperProps> = ({
    children,
    initialState,
}) => {
    const canvasRef = React.createRef<HTMLCanvasElement>();

    const [state, dispatch] = useReducer(DialogsReducer, initialState);

    return (
        <DialogsContext.Provider value={{ state: state, dispatch: dispatch }}>
            {children}
        </DialogsContext.Provider>
    );
};
