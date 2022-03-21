import { ColorPicker } from '@fluentui/react';
import { mount } from 'enzyme';
import React from 'react';

import { CanvasContextHelper } from '../../test-helper/CanvasContextHelper';
import { CopyLinkDialog } from './CopyLinkDialog';

describe('CopyLinkDialog', () => {
    it('Should render copy link dialog without errors', async () => {
        const component = mount(
            <CanvasContextHelper>
                <CopyLinkDialog isVisible={true} />
            </CanvasContextHelper>,
        );

        expect(component.exists(CopyLinkDialog)).toBeTruthy();

        component.unmount();
    });

    it('Should hide copy link dialog if isVisible false', async () => {
        const component = mount(
            <CanvasContextHelper>
                <CopyLinkDialog isVisible={false} />
            </CanvasContextHelper>,
        );

        expect(component.exists(ColorPicker)).toBeFalsy();

        component.unmount();
    });
});
