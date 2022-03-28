import {
  Button, Card, Container, Grid, Group, Title, useMantineTheme,
} from '@mantine/core';
import React from 'react';
import { Link } from 'react-router-dom';

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
              <Link to="/room"><Button>Join a Typing Race</Button></Link>
            </Group>
          </Card>
        </Grid.Col>
        <Grid.Col span={6}>
          <Card style={whiteBg}>
            <Group direction="column" spacing="xs">
              <Title order={5}>Improve your typing skills alone</Title>
              <Link to="/room/solo"><Button color="cyan">Practice Typing Alone</Button></Link>
            </Group>
          </Card>
        </Grid.Col>
        <Grid.Col span={6}>
          <Card style={whiteBg}>
            <Group direction="column" spacing="xs">
              <Title order={5}>Create a room and invite your friends</Title>
              <Link to="/room/private"><Button color="cyan">Race your friends</Button></Link>
            </Group>
          </Card>
        </Grid.Col>
      </Grid>
    </Container>
  );
};

export default Home;
