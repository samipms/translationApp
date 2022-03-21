/** MFS APP PACKAGE */

import {
    MfsDataStore,
    MfsItem,
    MfsSystemProperty,
    RequiredKeys,
} from '@metaos/mfs-client';

export const MFS_APP_ID = 'MfsAppId';

export type User = {
    id: string;
    name: string;
};

export type MfsAppData = {
    user: User;
    numLikes: number;
    label: string;
};

export type MfsAppItem = MfsItem & MfsAppData;

type MfsAppProperty = RequiredKeys<MfsAppData>;

// Record of all required properties of MfsAppItem:
export const MfsAppProperties: Record<
    MfsAppProperty | MfsSystemProperty,
    boolean
> = {
    id: true,
    origin: true,
    user: true,
    numLikes: true,
    label: true,
};

export interface MfsAppDataModel {
    store: MfsDataStore;
    addUser(): void;
    getUser(): User | undefined;
    getUsers(): User[];
    like: (itemId: string) => Promise<void>;
    getAppItem(itemId: string): Promise<MfsAppItem | undefined>;
    getItemsFromBoard: (
        filterString?: string,
    ) => AsyncIterableIterator<Partial<MfsAppItem>>;
    createAppItem: (label: string) => Promise<MfsAppItem>;
    createDemoItem: () => string;
    clear: () => void;
}
