import { Spinner } from '@fluentui/react';
import { mount } from 'enzyme';
import React from 'react';

import { LoadingPage } from './LoadingPage';

describe('LoadingPage', () => {
    it('Should render loading page without errors', async () => {
        const component = mount(<LoadingPage />);

        expect(component.exists(Spinner)).toBeTruthy();

        component.unmount();
    });
});
