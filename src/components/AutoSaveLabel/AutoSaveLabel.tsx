import { Icon, Stack } from '@fluentui/react';
import React from 'react';

import styles from './AutoSaveLabel.module.scss';

export const AutoSaveLabel: React.FC = (): JSX.Element => {
    return (
        <Stack className={styles.autoSaveIconContainer}>
            <Icon iconName={'Refresh'} className={styles.refreshIcon} />
            <Icon iconName={'Cloud'} className={styles.cloudIcon} />
        </Stack>
    );
};
