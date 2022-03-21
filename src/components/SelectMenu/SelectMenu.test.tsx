import { CommandBarButton } from '@fluentui/react';
import { mount } from 'enzyme';
import React from 'react';

import { SelectMenu } from './SelectMenu';

describe('Select Menu', () => {
    it('Should render SelectMenu without errors', async () => {
        const component = mount(<SelectMenu top={0} left={0} hidden={false} />);

        expect(component.exists(CommandBarButton)).toBeTruthy();

        component.unmount();
    });

    it('Should not SelectMenu when hidden is true', async () => {
        const component = mount(<SelectMenu top={0} left={0} hidden={true} />);

        expect(component.find('div').props()).toHaveProperty('hidden', true);

        component.unmount();
    });
});
