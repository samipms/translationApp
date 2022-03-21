import { initializeIcons } from '@fluentui/react';
import { app } from '@microsoft/metaos-app-sdk';
import * as React from 'react';
import { render } from 'react-dom';

import AppInitializer from './components/AppInitializer';

const root = document.getElementById('root');
app.initialize();
app.notifyAppLoaded();
app.notifySuccess();
initializeIcons(
    'https://static2.sharepointonline.com/files/fabric/assets/icons/',
);

render(<AppInitializer />, root);
