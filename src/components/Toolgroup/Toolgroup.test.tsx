import { Stack } from '@fluentui/react';
import { mount } from 'enzyme';
import React from 'react';

import { Toolgroup } from './Toolgroup';

describe('Toolbutton', () => {
    it('Should render toolgroup without errors', async () => {
        const component = mount(<Toolgroup>test children</Toolgroup>);

        expect(component.exists(Stack)).toBeTruthy();
        expect(component.text()).toContain('test children');

        component.unmount();
    });
});
