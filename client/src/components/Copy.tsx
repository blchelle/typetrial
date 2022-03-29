import React from 'react';
import {
  ActionIcon, Group, Paper, Text, Tooltip, useMantineTheme,
} from '@mantine/core';
import { IoClipboard } from 'react-icons/io5';
import { useClipboard } from '@mantine/hooks';

interface CopyProps {
    text: string
    withIcon?: boolean
}

const Copy: React.FC<CopyProps> = ({ text, withIcon = false }) => {
  const clipboard = useClipboard({ timeout: 1000 });
  const { colors } = useMantineTheme();

  return (
    <Tooltip
      label={clipboard.copied ? '  Copied  ' : 'Copy Link'}
      withArrow
      style={{ display: 'block' }}
      color={clipboard.copied ? 'green' : 'gray'}
      position="right"
    >
      <Paper
        style={{ backgroundColor: colors.blue[0] }}
        padding="sm"
        onClick={() => clipboard.copy(text)}
      >
        <Group position="apart">
          <Text size="sm" color={colors.blue[7]} weight="bold">{text}</Text>
          { withIcon && <ActionIcon color="blue"><IoClipboard /></ActionIcon> }
        </Group>
      </Paper>
    </Tooltip>
  );
};

export default Copy;
