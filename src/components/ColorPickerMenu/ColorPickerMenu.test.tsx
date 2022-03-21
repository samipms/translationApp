import { ColorPicker } from '@fluentui/react';
import { mount } from 'enzyme';
import React from 'react';

import { CanvasContextHelper } from '../../test-helper/CanvasContextHelper';
import { ColorPickerMenu } from './ColorPickerMenu';

describe('ColorPickerMenu', () => {
    it('Should render color picker without errors', async () => {
        const component = mount(
            <CanvasContextHelper>
                <ColorPickerMenu isVisible={true} />
            </CanvasContextHelper>,
        );

        expect(component.exists(ColorPicker)).toBeTruthy();

        component.unmount();
    });

    it('Should hide color picker if isVisible false', async () => {
        const component = mount(
            <CanvasContextHelper>
                <ColorPickerMenu isVisible={false} />
            </CanvasContextHelper>,
        );

        expect(component.exists(ColorPicker)).toBeFalsy();

        component.unmount();
    });
});
