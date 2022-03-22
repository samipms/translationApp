import React, { ChangeEventHandler, useCallback, useReducer, useState } from 'react';

import styles from './App.module.scss';

// Main entrypoint to paint app
// Initialize all app state/contexts here
export const App = (): JSX.Element => {
    const [enterText, setEnterText] = useState('');
    const [translation, setTranslation] = useState('');
    const [fromLang, setFromLang] = useState('en');
    const [toLang, setToLang] = useState('es');

    function handleTranslate() {
        const data = [{ text: enterText }];
        const url =
            'https://api.cognitive.microsofttranslator.com/translate?api-version=3.0&from=' +
            fromLang +
            '&to=' +
            toLang;

        fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Ocp-Apim-Subscription-Key': '28e1385cc5654626a1343662610d6424',
                'Ocp-Apim-Subscription-Region': 'westus2',
            },
            body: JSON.stringify(data),
        })
            .then((response) => response.json())
            .then((data) => {
                console.log('Success:', JSON.stringify(data[0]));
                setTranslation(data[0].translations[0].text);
            })
            .catch((error) => {
                console.error('Error:', error);
            });
    }

    return (
        <div>
            <h1>Translation App</h1>

            <select
                name="fromLang"
                onChange={(e) => {
                    setFromLang(e.target.value);
                    handleTranslate();
                }}
            >
                <option value="en">English</option>
                <option value="es">Spanish</option>
                <option value="cn">Chinese</option>
            </select>
            <br></br>
            <textarea
                placeholder="Enter Text"
                name="EnterText"
                value={enterText}
                style={{ height: '300px', width: '600px' }}
                onChange={(e) => {
                    setEnterText(e.target.value);
                    handleTranslate();
                }}
            />
            <br />
            <br></br>
            <select
                name="toLang"
                onChange={(e) => {
                    setToLang(e.target.value);
                    handleTranslate();
                }}
            >
                <option value="en">English</option>
                <option selected value="es">
                    Spanish
                </option>
                <option value="cn">Chinese</option>
            </select>
            <br></br>
            <textarea
                readOnly
                placeholder="Translation"
                name="Translation"
                value={translation}
                style={{ height: '300px', width: '600px' }}
            />
        </div>
    );
};

export default App;
