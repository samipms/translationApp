import { Spinner } from '@fluentui/react';
import { mount } from 'enzyme';
import React from 'react';

import { SelectMenu } from '../SelectMenu/SelectMenu';
import { ImageEditor } from './ImageEditor';

describe('ImageEditor', () => {
    it('Should render Image Editor without errors', async () => {
        const props = {
            imageSrc: '',
            isImageEditing: true,
            width: 100,
            height: 100,
            setIsMoving: () => {},
            setIsResizing: () => {},
            imageTop: 0,
            imageLeft: 0,
            imageRefPlot: null,
            onImageMouseMove: () => {},
            onImageMouseUp: () => {},
            onResizeMouseMove: () => {},
            onResizeMouseUp: () => {},
            onCropCanvas: () => {},
            onImageEditingStateChange: () => {},
            onSizeChange: () => {},
        };

        const component = mount(<ImageEditor {...props} />);

        expect(component.exists(SelectMenu)).toBeTruthy();

        component.unmount();
    });
});
