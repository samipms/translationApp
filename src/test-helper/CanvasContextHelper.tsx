import React, { useReducer } from 'react';

import {
    CanvasContext,
    CanvasReducer,
    initialCanvasState,
} from '../components/CanvasContext/CanvasContext';

export const CanvasContextHelper: React.FC = ({ children }) => {
    const canvasRef = React.createRef<HTMLCanvasElement>();

    const [state, dispatch] = useReducer(CanvasReducer, initialCanvasState);

    React.useEffect(() => {
        const canvas = canvasRef.current;
        dispatch({
            type: 'setContext',
            value: canvas?.getContext('2d') ?? undefined,
        });
    }, []);

    return (
        <CanvasContext.Provider value={{ state: state, dispatch: dispatch }}>
            {children}
            <canvas ref={canvasRef} />
        </CanvasContext.Provider>
    );
};
