import { Icon } from '@fluentui/react';
import { mount } from 'enzyme';
import React from 'react';

import { AutoSaveLabel } from './AutoSaveLabel';

describe('Auto Save Label', () => {
    it('Should render Auto save label without errors', async () => {
        const component = mount(<AutoSaveLabel />);

        expect(component.exists(Icon)).toBeTruthy();

        component.unmount();
    });
});
