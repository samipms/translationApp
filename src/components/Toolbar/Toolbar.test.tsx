import { mount } from 'enzyme';
import React from 'react';

import { Toolbutton } from '../ToolButton/Toolbutton';
import { Toolgroup } from '../Toolgroup/Toolgroup';
import { Toolbar } from './Toolbar';

describe('Toolbar', () => {
    it('Should render toolbar without errors', async () => {
        const onOpen = async () => {};
        const component = mount(
            <Toolbar
                onOpen={onOpen}
                onUndoClicked={() => {}}
                onRedoClicked={() => {}}
            />,
        );

        expect(component.exists(Toolbutton)).toBeTruthy();
        expect(component.exists(Toolgroup)).toBeTruthy();

        component.unmount();
    });
});
