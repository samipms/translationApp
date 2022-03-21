import { DefaultButton, Icon } from '@fluentui/react';
import { mount } from 'enzyme';
import React from 'react';

import { Toolbutton } from '../ToolButton/Toolbutton';

describe('Toolbutton', () => {
    it('Should render toolbutton without errors', async () => {
        const component = mount(<Toolbutton />);

        expect(component.exists(DefaultButton)).toBeTruthy();
        expect(component.exists(Icon)).toBeTruthy();

        component.unmount();
    });
});
