import { MfsDataStore } from '@metaos/mfs-client/dist/store/mfsDataStore';
import { Client } from '@microsoft/microsoft-graph-client';
import React from 'react';

type MfsContextType = {
    dataStore?: MfsDataStore;
    graphClient?: Client;
};

export const MfsContext = React.createContext<MfsContextType>({});
