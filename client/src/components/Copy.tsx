import React from 'react';
import {
  Group, Paper, Text, useMantineTheme,
} from '@mantine/core';

interface CopyProps {
    text: string
}

const Copy: React.FC<CopyProps> = ({ text }) => {
  const { colors } = useMantineTheme();

  return (
    <Paper
      style={{ backgroundColor: colors.blue[0] }}
      padding="sm"
    >
      <Group position="apart">
        <Text size="sm" color={colors.blue[7]} weight="bold">{text}</Text>
      </Group>
    </Paper>
  );
};

export default Copy;
