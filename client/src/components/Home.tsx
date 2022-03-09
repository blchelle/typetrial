import {
  Button, Card, Container, Grid, Group, Title, useMantineTheme,
} from '@mantine/core';
import React from 'react';

const Home: React.FC = () => {
  const { colors } = useMantineTheme();
  const whiteBg = { backgroundColor: colors.gray[0] };

  return (
    <Container>
      <Grid>
        <Grid.Col span={12}>
          <Card style={whiteBg}>
            <Group direction="column" spacing="xs">
              <Title order={4}>Race Opponents from Around the World</Title>
              <Button>Join a Typing Race</Button>
            </Group>
          </Card>
        </Grid.Col>
        <Grid.Col span={6}>
          <Card style={whiteBg}>
            <Group direction="column" spacing="xs">
              <Title order={5}>Improve your typing skills alone</Title>
              <Button color="cyan">Practice Typing Alone</Button>
            </Group>
          </Card>
        </Grid.Col>
        <Grid.Col span={6}>
          <Card style={whiteBg}>
            <Group direction="column" spacing="xs">
              <Title order={5}>Create a room and invite your friends</Title>
              <Button color="cyan">Race your friends</Button>
            </Group>
          </Card>
        </Grid.Col>
      </Grid>
    </Container>
  );
};

export default Home;
