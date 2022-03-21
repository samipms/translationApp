import { Slider } from '@fluentui/react';
import { mount } from 'enzyme';
import React from 'react';

import { CanvasContextHelper } from '../../test-helper/CanvasContextHelper';
import { DialogContextHelper } from '../../test-helper/DialogContextHelper';
import { DialogsState } from '../DialogsContext/DialogsContext';
import { BrushOptionPane } from './BrushOptionPane';

describe('BrushOptionPane', () => {
    it('should not render either option panes', () => {
        const component = mount(
            <CanvasContextHelper>
                <BrushOptionPane />
            </CanvasContextHelper>,
        );
        expect(component.exists(Slider)).toBeFalsy();
        component.unmount();
    });

    it('should render brush option pane', () => {
        const initialDialogState: DialogsState = {
            isBrushOptionPaneVisible: true,
            isEraserOptionPaneVisible: false,
            isShapeOptionPaneVisible: false,
            isColorPickerCalloutVisible: false,
            isSaveDialogVisible: false,
            isOpenDialogVisible: false,
            isTextOptionPaneVisible: false,
            isHighlighterOptionPaneVisible: false,
            isBucketOptionPaneVisible: false,
            isCopyLinkDialogVisible: false,
        };

        const component = mount(
            <CanvasContextHelper>
                <DialogContextHelper initialState={initialDialogState}>
                    <BrushOptionPane />
                </DialogContextHelper>
            </CanvasContextHelper>,
        );
        expect(component.exists(Slider)).toBeTruthy();
        component.unmount();
    });
});
