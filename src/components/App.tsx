import { optionProperties } from '@fluentui/react';
import React, { ChangeEventHandler, useCallback, useReducer, useState } from 'react';

import styles from './App.module.scss';

export interface SearchResult {
    fromLang: string;
    toLang: string;
    enterText: string;
    translation: string;
}

// Main entrypoint to paint app
// Initialize all app state/contexts here
export const App = (): JSX.Element => {
    const [enterText, setEnterText] = useState('');
    const [translation, setTranslation] = useState('');
    const [fromLang, setFromLang] = useState('en');
    const [toLang, setToLang] = useState('es');
    const [history, setHistory] = useState([]);

    window.addEventListener('focus', () => {
        navigator.clipboard
            .readText()
            .then((text) => {
                if (text !== '' && text !== enterText && text != translation) {
                    setEnterText(text);
                    handleTranslate(text);
                }
            })
            .catch((err) => {
                console.log('Failed to read from clipboard', err);
            });
    });

    function handleTranslate(input: string | undefined) {
        const data = input ? [{ text: input }] : [{ text: enterText }];
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
                navigator.clipboard.writeText(data[0].translations[0].text);
            })
            .catch((error) => {
                console.error('Error:', error);
            });
    }

    function handleSave() {
        const searchResult: SearchResult = {
            fromLang: fromLang,
            toLang: toLang,
            enterText: enterText,
            translation: translation,
        };
        setHistory((oldHistory) => [...oldHistory, searchResult]);
    }

    function handleUse(searchResult: SearchResult) {
        setFromLang(searchResult.fromLang);
        setToLang(searchResult.toLang);
        setEnterText(searchResult.enterText);
        setTranslation(searchResult.translation);
    }

    function handleRemove(index: number) {
        setHistory(history.filter((_item, i) => i != index));
    }

    const langOptions = [
        { id: 1, value: 'af', name: 'Afrikanns' },
        { id: 2, value: 'sq', name: 'Albanian' },
        { id: 3, value: 'am', name: 'Amharic' },
        { id: 4, value: 'ar', name: 'Arabic' },
        { id: 5, value: 'hy', name: 'Armenian' },
        { id: 6, value: 'as', name: 'Assamese' },
        { id: 7, value: 'az', name: 'Azerbaijani' },
        { id: 8, value: 'bn', name: 'Bangla' },
        { id: 9, value: 'ba', name: 'Bashkir' },
        { id: 10, value: 'bs', name: 'Bosnian' },
        { id: 11, value: 'bg', name: 'Bulgarian' },
        { id: 12, value: 'yue', name: 'Cantonese' },
        { id: 13, value: 'ca', name: 'Catalan' },
        { id: 14, value: 'lzh', name: 'Chinese' },
        { id: 15, value: 'zh-Hans', name: 'Chinese Simplified' },
        { id: 16, value: 'zh-Hant', name: 'Chinese Traditional' },
        { id: 17, value: 'hr', name: 'Crotian' },
        { id: 18, value: 'cs', name: 'Czech' },
        { id: 19, value: 'da', name: 'Danish' },
        { id: 20, value: 'prs', name: 'Dari' },
        { id: 21, value: 'dv', name: 'Divehi' },
        { id: 22, value: 'nl', name: 'Dutch' },
        { id: 23, value: 'en', name: 'English' },
        { id: 24, value: 'et', name: 'Estonian' },
        { id: 25, value: 'fj', name: 'Fijian' },
        { id: 26, value: 'fil', name: 'Filipino' },
        { id: 27, value: 'fi', name: 'Finnish' },
        { id: 28, value: 'fr', name: 'French' },
        { id: 29, value: 'ka', name: 'Georgian' },
        { id: 30, value: 'de', name: 'German' },
        { id: 31, value: 'el', name: 'Greek' },
        { id: 32, value: 'gu', name: 'Gujarti' },
        { id: 33, value: 'ht', name: 'Haitian' },
        { id: 34, value: 'he', name: 'Hebrew' },
        { id: 35, value: 'hi', name: 'Hindi' },
        { id: 36, value: 'mww', name: 'Hmong' },
        { id: 37, value: 'hu', name: 'Hungarian' },
        { id: 38, value: 'is', name: 'Icelandic' },
        { id: 39, value: 'id', name: 'Indonesian' },
        { id: 40, value: 'ikt', name: 'Inuinnaqtun' },
        { id: 41, value: 'iu', name: 'Inuktitut' },
        { id: 42, value: 'ga', name: 'Irish' },
        { id: 43, value: 'it', name: 'Italian' },
        { id: 44, value: 'ja', name: 'Japanese' },
        { id: 45, value: 'kn', name: 'Kannada' },
        { id: 46, value: 'kk', name: 'Kazakh' },
        { id: 47, value: 'km', name: 'Khmer' },
        { id: 48, value: 'ko', name: 'Korean' },
        { id: 49, value: 'ku', name: 'Kurdish' },
        { id: 50, value: 'ky', name: 'Kyrgyz' },
        { id: 51, value: 'lo', name: 'Lao' },
        { id: 52, value: 'lv', name: 'Latvian' },
        { id: 53, value: 'lt', name: 'Lithuanian' },
        { id: 54, value: 'mk', name: 'Macedonian' },
        { id: 55, value: 'mg', name: 'Malagasy' },
        { id: 56, value: 'ms', name: 'Malay' },
        { id: 57, value: 'ml', name: 'Malayalam' },
        { id: 58, value: 'mt', name: 'Maltese' },
        { id: 59, value: 'mi', name: 'Maori' },
        { id: 60, value: 'mr', name: 'Marathi' },
        { id: 61, value: 'my', name: 'Myanmar' },
        { id: 62, value: 'ne', name: 'Nepali' },
        { id: 63, value: 'nb', name: 'Norwegian' },
        { id: 64, value: 'or', name: 'Odia' },
        { id: 65, value: 'ps', name: 'Pashto' },
        { id: 66, value: 'fa', name: 'Persian' },
        { id: 67, value: 'pl', name: 'Polish' },
        { id: 68, value: 'pt', name: 'Portuguese' },
        { id: 69, value: 'pa', name: 'Punjabi' },
        { id: 70, value: 'otq', name: 'Queretaro' },
        { id: 71, value: 'ro', name: 'Romanian' },
        { id: 72, value: 'ru', name: 'Russian' },
        { id: 73, value: 'sm', name: 'Samoan' },
        { id: 74, value: 'sr-Cyrl', name: 'Serbian Cyrillic' },
        { id: 75, value: 'sr-Latn', name: 'Serbian Latin' },
        { id: 76, value: 'sk', name: 'Slovak' },
        { id: 77, value: 'sl', name: 'Slovenian' },
        { id: 78, value: 'so', name: 'Somali' },
        { id: 79, value: 'es', name: 'Spanish' },
        { id: 80, value: 'sw', name: 'Swahili' },
        { id: 81, value: 'sv', name: 'Swedish' },
        { id: 82, value: 'ty', name: 'Tahitian' },
        { id: 83, value: 'ta', name: 'Tamil' },
        { id: 84, value: 'tt', name: 'Tatar' },
        { id: 85, value: 'te', name: 'Telugu' },
        { id: 86, value: 'th', name: 'Thai' },
        { id: 87, value: 'bo', name: 'Tibetan' },
        { id: 88, value: 'ti', name: 'Tigrinya' },
        { id: 89, value: 'to', name: 'Tongan' },
        { id: 90, value: 'tr', name: 'Turkish' },
        { id: 91, value: 'tk', name: 'Turkmen' },
        { id: 92, value: 'uk', name: 'Ukrainian' },
        { id: 93, value: 'hsb', name: 'Upper Sorbian' },
        { id: 94, value: 'ur', name: 'Urdu' },
        { id: 95, value: 'ug', name: 'Uyghur' },
        { id: 96, value: 'uz', name: 'Uzbek' },
        { id: 97, value: 'vi', name: 'Vietnamese' },
        { id: 98, value: 'cy', name: 'Welsh' },
        { id: 99, value: 'yua', name: 'Yucatec Maya' },
    ];

    return (
        <div>
            <h1>Translation App</h1>

            <select
                name="fromLang"
                value={fromLang}
                onChange={(e) => {
                    setFromLang(e.target.value);
                    handleTranslate(undefined);
                }}
            >
                {langOptions.map((lang) => (
                    <option key={lang.id} value={lang.value}>
                        {lang.name}
                    </option>
                ))}
            </select>
            <br></br>
            <textarea
                placeholder="Enter Text"
                name="EnterText"
                value={enterText}
                style={{ height: '300px', width: '600px' }}
                onChange={(e) => {
                    setEnterText(e.target.value);
                    handleTranslate(undefined);
                }}
            />
            <br />
            <br></br>
            <select
                name="toLang"
                value={toLang}
                onChange={(e) => {
                    setToLang(e.target.value);
                    handleTranslate(undefined);
                }}
            >
                {langOptions.map((lang) => (
                    <option key={lang.id} value={lang.value}>
                        {lang.name}
                    </option>
                ))}
            </select>
            <br></br>
            <textarea
                readOnly
                placeholder="Translation"
                name="Translation"
                value={translation}
                style={{ height: '300px', width: '600px' }}
            />
            <br></br>
            <button name="save" onClick={handleSave}>
                Save
            </button>
            <br></br>
            <ul>
                {history.map((searchResult, index) => (
                    // Setting "index" as key because name and age can be repeated, It will be better if you assign uniqe id as key
                    <li key={index}>
                        <span>
                            <b>From:</b> {searchResult.fromLang}
                        </span>{' '}
                        <span>
                            <b>To:</b> {searchResult.toLang}
                        </span>{' '}
                        <span>
                            <b>EnterText:</b> {searchResult.enterText}
                        </span>{' '}
                        <span>
                            <b>Translation:</b> {searchResult.translation}
                        </span>
                        <button onClick={() => handleUse(searchResult)}>
                            Use
                        </button>
                        <button onClick={() => handleRemove(index)}>
                            Remove
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default App;
