import { Slider } from '@fluentui/react';
import { mount } from 'enzyme';
import React from 'react';
import { act } from 'react-dom/test-utils';

import { CanvasContextHelper } from '../../test-helper/CanvasContextHelper';
import { Props, SizeSlider } from './SizeSlider';

describe('SizeSlider', () => {
    it('Should render correct default value and trigger updateContextSize when slider changes value', async () => {
        const updateFn = jest.fn();
        const defaultVal = 100;
        const prop = {
            isVisible: true,
            defaultValue: defaultVal,
            updateContextSize: updateFn,
        } as Props;
        const component = mount(
            <CanvasContextHelper>
                <SizeSlider {...prop} />
            </CanvasContextHelper>,
        );
        expect(component.exists(SizeSlider)).toBeTruthy();
        expect(component.exists(Slider)).toBeTruthy();
        expect(component.find(SizeSlider).prop('isVisible')).toBeTruthy();
        expect(
            component.find(SizeSlider).find(Slider).prop('defaultValue'),
        ).toEqual(defaultVal);

        act(() => {
            component.find(SizeSlider).find(Slider).at(0).prop('onChange')!(
                {} as any,
            );
            component.update();
        });

        expect(updateFn).toHaveBeenCalled();
        component.unmount();
    });
});
