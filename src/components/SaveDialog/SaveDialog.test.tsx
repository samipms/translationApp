import { Dialog } from '@fluentui/react';
import { mount } from 'enzyme';
import React from 'react';

import { CanvasContextHelper } from '../../test-helper/CanvasContextHelper';
import { SaveDialog } from './SaveDialog';

describe('SaveDialog', () => {
    it('Should render save dialog without errors', async () => {
        const onFileSave = () => {};
        const toggleHidDialog = () => {};
        const component = mount(
            <CanvasContextHelper>
                <SaveDialog
                    isHidden={false}
                    toggleHideDialog={toggleHidDialog}
                    onFileSave={onFileSave}
                />
            </CanvasContextHelper>,
        );

        expect(component.exists(Dialog)).toBeTruthy();

        component.unmount();
    });
});
