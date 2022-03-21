import React, { ChangeEventHandler, useCallback, useReducer, useState } from 'react';

import styles from './App.module.scss';

// Main entrypoint to paint app
// Initialize all app state/contexts here
export const App = (): JSX.Element => {
    const [translation, setTranslation] = useState('');

    function handleTranslate(value) {
        setTranslation(value);
    }

    return (
        <div>
            <h1>Translation App</h1>

            <select name="sourceLang">
                <option value="en">English</option>
                <option value="es">Spanish</option>
                <option value="cn">Chinese</option>
            </select>
            <br></br>
            <input
                type="textarea"
                placeholder="Enter Text"
                name="EnterText"
                style={{ height: '300px', width: '600px' }}
                onChange={(e) => handleTranslate(e.target.value)}
            />
            <br />
            <br></br>
            <select name="targetLang">
                <option value="en">English</option>
                <option value="es">Spanish</option>
                <option value="cn">Chinese</option>
            </select>
            <br></br>
            <input
                readOnly
                type="textarea"
                placeholder="Translation"
                name="Translation"
                id="Translation"
                value={translation}
                style={{ height: '300px', width: '600px' }}
            />
        </div>
    );
};

export default App;
