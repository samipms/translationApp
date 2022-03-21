import { mount } from 'enzyme';
import React from 'react';

import { CanvasContextHelper } from '../../test-helper/CanvasContextHelper';
import { Canvas } from './Canvas';

describe('Canvas', () => {
    it('Should render canvas without errors', async () => {
        const component = mount(
            <CanvasContextHelper>
                <Canvas />
            </CanvasContextHelper>,
        );

        expect(component.find('canvas').length).toBeGreaterThan(0);

        component.unmount();
    });
});
