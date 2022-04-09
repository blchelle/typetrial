import WS from 'jest-websocket-mock';
import { mount } from 'enzyme';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { Button, Text } from '@mantine/core';
import { act } from 'react-dom/test-utils';
import { NotificationsProvider } from '@mantine/notifications';
import WaitingRoom from '../../components/WaitingRoom';
import env from '../../config/environment';
import Racer from '../../components/Racer';
import Copy from '../../components/Copy';
import TypingZone from '../../components/TypingZone';
import Countdown from '../../components/Countdown';

const USER1 = 'user1';
const USER2 = 'user2';
const ROOM_ID = '1';

const joinedTime = Date.now();
const countdownStart = Date.now();
const raceStart = countdownStart;
const PLAYER_COLORS = ['#F52E2E', '#5463FF', '#FFC717', '#1F9E40', '#FF6619'];

describe('WaitingRoom', () => {
  const fakeURL = `${env.baseSocketUrl}/api/connect/${USER1}`;
  let mockServer: WS;
  const mockUser = { username: USER1 };
  beforeEach(() => {
    mockServer = new WS(fakeURL);
    localStorage.setItem('user', JSON.stringify(mockUser));
  });
  afterEach(() => {
    mockServer.close();
    localStorage.clear();
  });
  it('join public room with passage', async () => {
    const RACE_INFO1 = {
      owner: '',
      roomId: ROOM_ID,
      hasStarted: false,
      isPublic: true,
      isSolo: false,
      passage: 'Hello',
      activeEffects: [],
      users: [USER1],
      userInfo: {
        [USER1]: {
          color: PLAYER_COLORS[0], charsTyped: 0, wpm: 0, finished: false, joinedTime, inventory: null,
        },
      },
    };
    const wrapper = mount(
      <NotificationsProvider>
        <MemoryRouter initialEntries={['/room']}>
          <Routes>
            <Route path="/room" element={<WaitingRoom isPublic />} />
          </Routes>
        </MemoryRouter>
      </NotificationsProvider>,
    );
    await mockServer.connected;
    await expect(mockServer).toReceiveMessage(JSON.stringify({ type: 'connect_public', public: true }));

    act(() => {
      mockServer.send(JSON.stringify({ type: 'raceData', raceInfo: RACE_INFO1 }));
    });

    wrapper.update();
    expect(wrapper.findWhere((node) => node.is(Text) && node.text().includes('Waiting for other users to join the race...'))).toHaveLength(1);
    expect(wrapper.findWhere((node) => node.is(Button) && node.text().includes('Start the Race'))).toHaveLength(0);
    expect(wrapper.findWhere((node) => node.is(Racer))).toHaveLength(1);
    expect(wrapper.findWhere((node) => node.is(Copy))).toHaveLength(0);
    expect(wrapper.findWhere((node) => node.is(Countdown))).toHaveLength(0);
    expect(wrapper.findWhere((node) => node.is(TypingZone))).toHaveLength(1);
  });
  it('join public room without passage', async () => {
    const RACE_INFO1 = {
      owner: '',
      roomId: ROOM_ID,
      hasStarted: false,
      isPublic: true,
      isSolo: false,
      activeEffects: [],
      users: [USER1],
      userInfo: {
        [USER1]: {
          color: PLAYER_COLORS[0], charsTyped: 0, wpm: 0, finished: false, joinedTime, inventory: null,
        },
      },
    };
    const wrapper = mount(
      <NotificationsProvider>
        <MemoryRouter initialEntries={['/room']}>
          <Routes>
            <Route path="/room" element={<WaitingRoom isPublic />} />
          </Routes>
        </MemoryRouter>
      </NotificationsProvider>,
    );
    await mockServer.connected;
    await expect(mockServer).toReceiveMessage(JSON.stringify({ type: 'connect_public', public: true }));

    act(() => {
      mockServer.send(JSON.stringify({ type: 'raceData', raceInfo: RACE_INFO1 }));
    });
    wrapper.update();
    expect(wrapper.findWhere((node) => node.is(Text) && node.text().includes('Waiting for other users to join the race...'))).toHaveLength(1);
    expect(wrapper.findWhere((node) => node.is(Button) && node.text().includes('Start the Race'))).toHaveLength(0);
    expect(wrapper.findWhere((node) => node.is(Racer))).toHaveLength(1);
    expect(wrapper.findWhere((node) => node.is(Copy))).toHaveLength(0);
    expect(wrapper.findWhere((node) => node.is(Countdown))).toHaveLength(0);
    expect(wrapper.findWhere((node) => node.is(TypingZone))).toHaveLength(0);
  });
  it('create private room', async () => {
    const RACE_INFO1 = {
      owner: USER1,
      roomId: ROOM_ID,
      hasStarted: false,
      isPublic: false,
      isSolo: false,
      activeEffects: [],
      users: [USER1],
      userInfo: {
        [USER1]: {
          color: PLAYER_COLORS[0], charsTyped: 0, wpm: 0, finished: false, joinedTime, inventory: null,
        },
      },
    };
    const wrapper = mount(
      <NotificationsProvider>
        <MemoryRouter initialEntries={['/room/private']}>
          <Routes>
            <Route path="/room/private" element={<WaitingRoom isCreator />} />
          </Routes>
        </MemoryRouter>
      </NotificationsProvider>
      ,
    );
    await mockServer.connected;
    await expect(mockServer).toReceiveMessage(JSON.stringify({ type: 'create_private', public: false, solo: false }));

    act(() => {
      mockServer.send(JSON.stringify({ type: 'raceData', raceInfo: RACE_INFO1 }));
    });
    wrapper.update();
    expect(wrapper.findWhere((node) => node.is(Text) && node.text().includes('Invite your friends with this link'))).toHaveLength(1);
    expect(wrapper.findWhere((node) => node.is(Button) && node.text().includes('Start the Race'))).toHaveLength(1);
    expect(wrapper.findWhere((node) => node.is(Racer))).toHaveLength(1);
    expect(wrapper.findWhere((node) => node.is(Copy))).toHaveLength(1);
    expect(wrapper.findWhere((node) => node.is(Countdown))).toHaveLength(0);
    expect(wrapper.findWhere((node) => node.is(TypingZone))).toHaveLength(0);
  });
  it('join private room', async () => {
    const RACE_INFO1 = {
      owner: USER2,
      roomId: ROOM_ID,
      hasStarted: false,
      isPublic: false,
      isSolo: false,
      activeEffects: [],
      users: [USER1],
      userInfo: {
        [USER1]: {
          color: PLAYER_COLORS[0], charsTyped: 0, wpm: 0, finished: false, joinedTime, inventory: null,
        },
      },
    };
    const wrapper = mount(
      <NotificationsProvider>
        <MemoryRouter initialEntries={['/room/private/123']}>
          <Routes>
            <Route path="/room/private/:roomId" element={<WaitingRoom />} />
          </Routes>
        </MemoryRouter>
      </NotificationsProvider>
      ,
    );
    await mockServer.connected;
    await expect(mockServer).toReceiveMessage(JSON.stringify({ type: 'connect_private', public: false, roomId: '123' }));

    act(() => {
      mockServer.send(JSON.stringify({ type: 'raceData', raceInfo: RACE_INFO1 }));
    });
    wrapper.update();
    expect(wrapper.findWhere((node) => node.is(Text) && node.text().includes('Waiting for the host to start the race...'))).toHaveLength(1);
    expect(wrapper.findWhere((node) => node.is(Button) && node.text().includes('Start the Race'))).toHaveLength(0);
    expect(wrapper.findWhere((node) => node.is(Racer))).toHaveLength(1);
    expect(wrapper.findWhere((node) => node.is(Countdown))).toHaveLength(0);
    expect(wrapper.findWhere((node) => node.is(TypingZone))).toHaveLength(0);
  });
  it('error handling', async () => {
    const wrapper = mount(
      <NotificationsProvider>
        <MemoryRouter initialEntries={['/room']}>
          <Routes>
            <Route path="/room" element={<WaitingRoom isPublic />} />
          </Routes>
        </MemoryRouter>
      </NotificationsProvider>,
    );
    await mockServer.connected;
    await expect(mockServer).toReceiveMessage(JSON.stringify({ type: 'connect_public', public: true }));

    act(() => {
      mockServer.send(JSON.stringify({ type: 'error', message: 'This is a test error message' }));
    });
    wrapper.update();
    expect(wrapper.findWhere((node) => node.is(Text) && node.text().includes('Waiting for the host to start the race...'))).toHaveLength(0);
    expect(wrapper.findWhere((node) => node.is(Button) && node.text().includes('Start the Race'))).toHaveLength(0);
    expect(wrapper.findWhere((node) => node.is(Racer))).toHaveLength(0);
    expect(wrapper.findWhere((node) => node.is(Countdown))).toHaveLength(0);
    expect(wrapper.findWhere((node) => node.is(TypingZone))).toHaveLength(0);
  });
  it('join public room with passage', async () => {
    const RACE_INFO1 = {
      owner: '',
      roomId: ROOM_ID,
      hasStarted: false,
      isPublic: true,
      isSolo: false,
      passage: 'Hello',
      joinedTime,
      countdownStart,
      raceStart,
      activeEffects: [],
      users: [USER1],
      userInfo: {
        [USER1]: {
          color: PLAYER_COLORS[0], charsTyped: 0, wpm: 0, finished: false, joinedTime, inventory: null,
        },
      },
    };
    const wrapper = mount(
      <NotificationsProvider>
        <MemoryRouter initialEntries={['/room']}>
          <Routes>
            <Route path="/room" element={<WaitingRoom isPublic />} />
          </Routes>
        </MemoryRouter>
      </NotificationsProvider>,
    );
    await mockServer.connected;
    await expect(mockServer).toReceiveMessage(JSON.stringify({ type: 'connect_public', public: true }));

    act(() => {
      mockServer.send(JSON.stringify({ type: 'raceData', raceInfo: RACE_INFO1 }));
    });

    wrapper.update();
    expect(wrapper.findWhere((node) => node.is(Text) && node.text().includes('Waiting for other users to join the race...'))).toHaveLength(0);
    expect(wrapper.findWhere((node) => node.is(Button) && node.text().includes('Start the Race'))).toHaveLength(0);
    expect(wrapper.findWhere((node) => node.is(Racer))).toHaveLength(1);
    expect(wrapper.findWhere((node) => node.is(Copy))).toHaveLength(0);
    expect(wrapper.findWhere((node) => node.is(Countdown))).toHaveLength(1);
    expect(wrapper.findWhere((node) => node.is(TypingZone))).toHaveLength(1);
  });
});
