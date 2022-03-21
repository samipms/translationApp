import '@testing-library/jest-dom';

import { setIconOptions } from '@fluentui/react';
// TODO: Add tests back
import { render } from '@testing-library/react';
import React from 'react';

import App from './App';

describe('App', () => {
    it('App renders', () => {
        setIconOptions({
            disableWarnings: true,
        });
        // Render App in the document
        render(<App />);
    });
});
