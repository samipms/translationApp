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
        console.log('uuu' + url);
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
                value={fromLang}
                onChange={(e) => {
                    setFromLang(e.target.value);
                    console.log('1111' + e.target.value);
                    handleTranslate();
                }}
            >
                <option value="ar">Arabic</option>
                <option value="bn">Bangla</option>
                <option value="zh-Hans">Chinese</option>
                <option value="cs">Czech</option>
                <option value="da">Danish</option>
                <option value="en">English</option>
                <option value="fi">Finnish</option>
                <option value="fr">Fench</option>
                <option value="de">German</option>
                <option value="el">Greek</option>
                <option value="hi">Hindi</option>
                <option value="is">Icelandic</option>
                <option value="id">Indonesian</option>
                <option value="ga">Irish</option>
                <option value="it">Italian</option>
                <option value="ja">Japanese</option>
                <option value="ko">Korean</option>
                <option value="lo">Lao</option>
                <option value="ms">Malay</option>
                <option value="my">Myanmar</option>
                <option value="po">Polish</option>
                <option value="pt">Portuguese</option>
                <option value="ro">Romanian</option>
                <option value="ru">Russian</option>
                <option value="es">Spanish</option>
                <option value="tr">Turkish</option>
                <option value="vi">Vietnamese</option>
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
                value={toLang}
                onChange={(e) => {
                    setToLang(e.target.value);
                    console.log('2222' + e.target.value);
                    handleTranslate();
                }}
            >
                <option value="ar">Arabic</option>
                <option value="bn">Bangla</option>
                <option value="zh-Hans">Chinese</option>
                <option value="cs">Czech</option>
                <option value="da">Danish</option>
                <option value="en">English</option>
                <option value="fi">Finnish</option>
                <option value="fr">Fench</option>
                <option value="de">German</option>
                <option value="el">Greek</option>
                <option value="hi">Hindi</option>
                <option value="is">Icelandic</option>
                <option value="id">Indonesian</option>
                <option value="ga">Irish</option>
                <option value="it">Italian</option>
                <option value="ja">Japanese</option>
                <option value="ko">Korean</option>
                <option value="lo">Lao</option>
                <option value="ms">Malay</option>
                <option value="my">Myanmar</option>
                <option value="po">Polish</option>
                <option value="pt">Portuguese</option>
                <option value="ro">Romanian</option>
                <option value="ru">Russian</option>
                <option value="es">Spanish</option>
                <option value="tr">Turkish</option>
                <option value="vi">Vietnamese</option>
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
