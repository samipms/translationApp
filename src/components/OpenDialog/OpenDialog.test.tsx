import { Modal } from '@fluentui/react';
import { mount } from 'enzyme';
import React from 'react';

import { CanvasContextHelper } from '../../test-helper/CanvasContextHelper';
import { OpenDialog } from './OpenDialog';

describe('OpenDialog', () => {
    it('Should render open dialog without errors', async () => {
        const onDismiss = () => {};
        const setIsFileModalOpen = () => {};
        const component = mount(
            <CanvasContextHelper>
                <OpenDialog
                    isOpen={true}
                    onDismiss={onDismiss}
                    paintItems={[]}
                    setIsFileModalOpen={setIsFileModalOpen}
                />
            </CanvasContextHelper>,
        );

        expect(component.exists(Modal)).toBeTruthy();

        component.unmount();
    });
});
