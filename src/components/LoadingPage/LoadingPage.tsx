import { Spinner, SpinnerSize, Stack, Text } from '@fluentui/react';
import React from 'react';

import styles from './LoadingPage.module.scss';

type Props = {
    title?: string;
};

export const LoadingPage: React.FC<Props> = ({ title }): JSX.Element => (
    <Stack className={styles.container} tokens={{ childrenGap: 12 }}>
        <Spinner size={SpinnerSize.large} />
        <Text>{title}</Text>
    </Stack>
);
