/** MFS APP PACKAGE */

import { MfsDataStore, MfsItem, MfsQuery } from '@metaos/mfs-client';

import {
    MfsAppData,
    MfsAppDataModel,
    MfsAppItem,
    MfsAppProperties,
    User,
} from './appModel';
import { AutoNote } from './demo';

export class MfsAppDataObject implements MfsAppDataModel {
    constructor(private readonly dataStore: MfsDataStore) {}

    get store(): MfsDataStore {
        return this.dataStore;
    }
    /** Creates a "fake" user based on a fake user id and a fake name. Only use this code for protoyping and demos. */
    addUser = (): void => {
        return;
    };

    getUser = (): User => {
        return { id: 'fakeid', name: 'test' };
    };

    getUsers(): User[] {
        const users: User[] = [];
        return users;
    }

    like = async (itemId: string): Promise<void> => {
        // ideally we should use counter dds *with atomic cas - but here we just do compare and set without atomicity
        const likes = (await this.store.getItemProperty(
            itemId,
            'numLikes',
        )) as number; // this can totally throw in Runtime. find a better way .== or maybe it's better to let it throw so we can fix it.
        const itemPatch: Pick<MfsAppItem, 'numLikes'> = { numLikes: likes + 1 };
        return this.store.patchItem(itemId, itemPatch);
    };

    createAppItem = async (label: string): Promise<MfsAppItem> => {
        const appData: MfsAppData = {
            numLikes: 0,
            user: this.getUser(),
            label: label,
        };

        const createdItem = await this.store.createItem<MfsAppItem>(appData);
        return createdItem;
    };

    getItemsFromBoard = (
        filter?: string,
    ): AsyncIterableIterator<MfsAppItem> => {
        const query: MfsQuery | undefined = filter
            ? {
                  filter: (itemMap) => {
                      // When defining filters on the ItemMap, you need to get the unique keys using getMfsItemKey
                      // Note that this returns the corresponding key for the label on the actual ItemMap
                      const label = (
                          itemMap.get(
                              this.store.getMfsItemKey('label'),
                          ) as string
                      ).toLowerCase();
                      return label.includes(filter.toLowerCase());
                  },
              }
            : undefined;

        return this.store.getItems(this.isMfsAppItem, query);
    };

    createDemoItem = (): string => {
        return AutoNote.createDemoNote();
    };

    clear = (): Promise<void> => {
        return this.store.deleteItems();
    };

    async getAppItem(itemId: string): Promise<MfsAppItem | undefined> {
        return this.store.getItem(itemId, this.isMfsAppItem);
    }

    private isMfsAppItem(item: MfsItem): item is MfsAppItem {
        for (const k in MfsAppProperties) {
            if (!(k in item)) {
                return false;
            }
        }

        return true;
    }
}
