import {
    Dialog,
    DialogType,
    Icon,
    ITextField,
    Label,
    PrimaryButton,
    Stack,
    TextField,
} from '@fluentui/react';
import React, {
    useCallback,
    useContext,
    useEffect,
    useRef,
    useState,
} from 'react';

import {
    createSharingLink,
    uploadImageToOneDrive,
} from '../../graph/GraphServiceApi';
import { CanvasContext } from '../CanvasContext/CanvasContext';
import { DialogsContext } from '../DialogsContext/DialogsContext';
import { MfsContext } from '../MfsContext/MfsContext';
import styles from './CopyLinkDialog.module.scss';

type Props = {
    isVisible: boolean;
};

export const CopyLinkDialog: React.FC<Props> = ({ isVisible }): JSX.Element => {
    const dialogsContext = useContext(DialogsContext);
    const canvasContext = useContext(CanvasContext);
    const [copiedLink, setcopiedLink] = useState('');
    const copyLinkTextFieldRef = useRef<ITextField>(null);
    const { graphClient } = useContext(MfsContext);

    useEffect(() => {
        const createShareLink = async () => {
            if (canvasContext.state.canvasRef && isVisible && !copiedLink) {
                if (!graphClient) {
                    return;
                }
                const dataUrl = canvasContext.state.canvasRef.toDataURL();
                const uploadId = await uploadImageToOneDrive(
                    graphClient,
                    dataUrl,
                );
                const link = await createSharingLink(graphClient, uploadId);
                setcopiedLink(link?.webUrl ?? 'undefined');
                copyButtonClick();
            }
        };
        createShareLink();
    }, [isVisible, copiedLink]);

    const hideDialog = useCallback(() => {
        if (isVisible) {
            dialogsContext.dispatch &&
                dialogsContext.dispatch({ type: 'toggleCopyLinkDialog' });
        }
    }, [isVisible]);

    const copyButtonClick = useCallback(() => {
        copyLinkTextFieldRef.current?.select();
        document.execCommand('copy');
    }, [copiedLink]);

    const dialogContentProps = {
        type: DialogType.close,
    };

    return (
        <>
            {copiedLink && (
                <Dialog
                    hidden={!isVisible}
                    onDismiss={hideDialog}
                    dialogContentProps={dialogContentProps}
                >
                    <Stack tokens={{ childrenGap: 10 }}>
                        <Stack.Item align="center">
                            <Icon iconName={'Accept'} className={styles.icon} />
                        </Stack.Item>
                        <Stack.Item align="center">
                            <Label>Link copied</Label>
                        </Stack.Item>
                        <Stack horizontal tokens={{ childrenGap: 5 }}>
                            <TextField
                                readOnly
                                componentRef={copyLinkTextFieldRef}
                                defaultValue={copiedLink}
                                className={styles.textfield}
                            ></TextField>
                            <PrimaryButton
                                text="Copy"
                                onClick={copyButtonClick}
                            />
                        </Stack>
                    </Stack>
                </Dialog>
            )}
        </>
    );
};
