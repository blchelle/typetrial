import WS from 'jest-websocket-mock';
import { mount } from 'enzyme';
import { TextInput } from '@mantine/core';
import { act } from 'react-dom/test-utils';
import { RaceData } from '@utils/types';
import TypingZone from '../../components/TypingZone';
import env from '../../config/environment';

const mockedUsedNavigate = jest.fn();

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom') as any,
  useNavigate: () => mockedUsedNavigate,
}));

const USER1 = 'user1';
const ROOM_ID = '1';
const PLAYER_COLORS = ['#F52E2E', '#5463FF', '#FFC717', '#1F9E40', '#FF6619'];
const joinedTime = Date.now();
const countdownStart = Date.now();
const raceStart = countdownStart;
const PASSAGE = 'Here is some sample passage text.';

const RACE_INFO1: RaceData = {
  owner: '',
  roomId: ROOM_ID,
  hasStarted: false,
  isPublic: true,
  isSolo: false,
  countdownStart,
  raceStart,
  passage: PASSAGE,
  activeEffects: [],
  users: [USER1],
  userInfo: {
    [USER1]: {
      color: PLAYER_COLORS[0], charsTyped: 0, wpm: 0, finished: false, joinedTime, inventory: null,
    },
  },
};

describe('TypingZone', () => {
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

  it('renders passage', async () => {
    const wrapper = mount(
      <TypingZone raceInfo={RACE_INFO1} websocket={mockServer} />,
    );
    wrapper.update();
    expect(wrapper.findWhere((node) => node.prop('id') === 'passage').render().text()).toEqual(PASSAGE);
  });

  it('is black when untyped', async () => {
    const wrapper = mount(
      <TypingZone raceInfo={RACE_INFO1} websocket={mockServer} />,
    );

    wrapper.update();
    expect(wrapper.findWhere((node) => node.prop('id') === 'passage').childAt(0).childAt(0).render()
      .css('color')).toEqual('rgb(33, 37, 41)');
  });

  it('is green when typed', async () => {
    const typedRaceInfo = { ...RACE_INFO1, userInfo: { ...RACE_INFO1.userInfo, [USER1]: { ...RACE_INFO1.userInfo[USER1], charsTyped: 10 } } };

    const wrapper = mount(
      <TypingZone raceInfo={typedRaceInfo} websocket={mockServer} />,
    );

    act(() => {
      wrapper.findWhere((node) => node.is(TextInput)).invoke('onChange')({ name: 'input', target: { value: PASSAGE[0] } });
      wrapper.update();
    });
    expect(wrapper.findWhere((node) => node.prop('id') === 'passage').childAt(0).childAt(0).render()
      .css('color')).toEqual('rgb(47, 158, 68)');
  });
});
