import WS from 'jest-websocket-mock';
import { WebSocket as MockSocket } from 'mock-socket';
import { WebSocket } from 'ws';
import { Passage } from '@prisma/client';
import WsHandler, { PLAYER_COLORS } from '../../websockets/websocketHandler';
import { RaceData, RaceDataMessage } from '../../utils/types';
import { getPassage } from '../../models/passage';

jest.mock('ws', () => ({
  WebSocket: jest.fn().mockImplementation((server) => new MockSocket(server)),
}));

jest.mock('../../models/passage');

const mockGetPassage = getPassage as jest.MockedFunction<typeof getPassage>;

describe('WsHandler', () => {
  const fakeURL = 'ws://localhost:8080';
  let mockServer: WS;
  let rooms: Map<string, RaceData>;
  let client1: WebSocket;
  let client2: WebSocket;
  let userInfo: Map<string, WebSocket>;

  let USER1 = 'user1';
  let USER2 = 'user2';
  let ROOMID = '1';
  let RACEINFO1: RaceData;
  let RACEINFOFULL1: RaceData;
  let RACEINFOPRIVATE: RaceData;
  let EXAMPLE_PASSAGE: Passage;

  const countdownStart = new Date().getTime();
  const raceStart = countdownStart + 1000;

  beforeEach(async () => {
    mockServer = new WS(fakeURL);
    client1 = new WebSocket(fakeURL);
    await mockServer.connected;
    client2 = new WebSocket(fakeURL);
    await mockServer.connected;

    mockGetPassage.mockReset();

    rooms = new Map<string, RaceData>();
    userInfo = new Map<string, WebSocket>();

    USER1 = 'user1';
    USER2 = 'user2';
    ROOMID = '1';
    RACEINFO1 = {
      owner: '',
      roomId: ROOMID,
      hasStarted: false,
      isPublic: true,
      isSolo: false,
      countdownStart,
      raceStart,
      passage: 'TODO',
      users: [USER1],
      userInfo: {
        [USER1]: {
          color: PLAYER_COLORS[0], charsTyped: 0, wpm: 0, finished: false,
        },
      },
    };
    RACEINFOFULL1 = {
      owner: '',
      roomId: ROOMID,
      hasStarted: false,
      isPublic: true,
      isSolo: false,
      countdownStart,
      raceStart,
      passage: 'TODO',
      users: [USER1, USER2],
      userInfo: {
        [USER1]: {
          color: PLAYER_COLORS[0], charsTyped: 0, wpm: 0, finished: false,
        },
        [USER2]: {
          color: PLAYER_COLORS[1], charsTyped: 0, wpm: 0, finished: false,
        },
      },
    };
    RACEINFOPRIVATE = {
      owner: USER1,
      roomId: ROOMID,
      hasStarted: false,
      isPublic: false,
      isSolo: false,
      countdownStart,
      raceStart,
      passage: 'TODO',
      users: [USER1, USER2],
      userInfo: {
        [USER1]: {
          color: PLAYER_COLORS[0], charsTyped: 0, wpm: 0, finished: false,
        },
        [USER2]: {
          color: PLAYER_COLORS[1], charsTyped: 0, wpm: 0, finished: false,
        },
      },
    };
    EXAMPLE_PASSAGE = { id: 0, text: 'sample passage text', source: null };
  });

  afterEach(() => {
    WS.clean();
  });

  it('connectUserNewRoom', async () => {
    mockGetPassage.mockResolvedValue(EXAMPLE_PASSAGE);

    const wsHandler = new WsHandler(1, undefined, undefined, 0);
    const data = wsHandler.connect_user_to_public_room(USER1, client1);

    expect(wsHandler.userInfo.size).toEqual(1);
    expect(wsHandler.rooms.size).toEqual(1);

    if (data) {
      const message: RaceDataMessage = { type: 'raceData', raceInfo: data };
      await expect(mockServer).toReceiveMessage(JSON.stringify(message));
    }
  });

  it('connectUserExistingRoom', async () => {
    rooms.set(ROOMID, RACEINFO1);
    userInfo.set(USER1, client1);

    const wsHandler = new WsHandler(2, rooms, userInfo, 0);
    wsHandler.connect_user_to_public_room(USER2, client2);

    expect(wsHandler.userInfo.size).toEqual(2);
    expect(wsHandler.rooms.size).toEqual(1);

    const message: RaceDataMessage = { type: 'raceData', raceInfo: RACEINFOFULL1 };

    await expect(mockServer).toReceiveMessage(JSON.stringify(message));
    await expect(mockServer).toReceiveMessage(JSON.stringify(message));

    mockServer.close();
  });

  it('createNewRoom', async () => {
    mockGetPassage.mockResolvedValue(EXAMPLE_PASSAGE);

    const wsHandler = new WsHandler(1, undefined, undefined, 0);
    const roomId = wsHandler.create_room(true, false);
    expect(wsHandler.rooms.size).toEqual(1);
    /* eslint no-promise-executor-return: "error" */
    await new Promise((res) => {
      setTimeout(() => {
        const raceInfo = wsHandler.rooms.get(roomId);
        expect(raceInfo?.hasStarted).toEqual(true);
        res(0);
      }, 2);
    });
  });

  it('connectUserFullRoom', async () => {
    mockGetPassage.mockResolvedValue(EXAMPLE_PASSAGE);

    rooms.set(ROOMID, RACEINFO1);
    userInfo.set(USER1, client1);

    const wsHandler = new WsHandler(1, rooms, userInfo, 0);

    wsHandler.connect_user_to_public_room(USER2, client2);

    expect(wsHandler.userInfo.size).toEqual(2);
    expect(wsHandler.rooms.size).toEqual(2);

    const message: RaceDataMessage = { type: 'raceData', raceInfo: RACEINFOFULL1 };
    await expect(mockServer).not.toReceiveMessage(JSON.stringify(message));
  });

  it('disconnectUserLastInRoom', async () => {
    rooms.set(ROOMID, RACEINFO1);
    userInfo.set(USER1, client1);

    const wsHandler = new WsHandler(1, rooms, userInfo, 0);
    wsHandler.disconnect_user_from_room(USER1, RACEINFO1);

    expect(wsHandler.userInfo.size).toEqual(0);
    expect(wsHandler.rooms.size).toEqual(0);
  });

  it('disconnectUserRoom', async () => {
    rooms.set(ROOMID, RACEINFOFULL1);
    userInfo.set(USER1, client1);
    userInfo.set(USER2, client2);

    const wsHandler = new WsHandler(2, rooms, userInfo, 0);
    wsHandler.disconnect_user_from_room(USER2, RACEINFOFULL1);

    expect(wsHandler.userInfo.size).toEqual(1);
    expect(wsHandler.rooms.size).toEqual(1);

    const message: RaceDataMessage = { type: 'raceData', raceInfo: RACEINFO1 };
    await expect(mockServer).toReceiveMessage(JSON.stringify(message));
  });

  // it('typeChar', async () => {
  //   rooms.set(ROOMID, RACEINFO1);
  //   userInfo.set(USER1, client1);

  //   const wsHandler = new WsHandler(2, rooms, userInfo, 0);
  //   wsHandler.type_char(1, USER1, RACEINFO1);

  //   const updatedRaceInfo = {
  //     owner: '', roomId: ROOMID, hasStarted: false, isPublic: true, raceStart: startDate, passage: 'TODO', users: [USER1], userInfo: { [USER1]: { color: PLAYER_COLORS[0], charsTyped: 1 } },
  //   };
  //   const message: RaceDataMessage = { type: 'raceData', raceInfo: updatedRaceInfo };

  //   await expect(mockServer).toReceiveMessage(JSON.stringify(message));
  // });

  it('ownerStartRace', async () => {
    rooms.set(ROOMID, RACEINFO1);
    userInfo.set(USER1, client1);

    const wsHandler = new WsHandler(2, rooms, userInfo, 0);
    wsHandler.start_race('', RACEINFO1);

    const updatedRaceInfo = {
      owner: '',
      roomId: ROOMID,
      hasStarted: true,
      isPublic: true,
      isSolo: false,
      countdownStart,
      raceStart,
      passage: 'TODO',
      users: [USER1],
      userInfo: {
        [USER1]: {
          color: PLAYER_COLORS[0], charsTyped: 0, wpm: 0, finished: false,
        },
      },
    };
    const message: RaceDataMessage = { type: 'raceData', raceInfo: updatedRaceInfo };

    await expect(mockServer).toReceiveMessage(JSON.stringify(message));
  });

  it('nonOwnerStartRace', async () => {
    rooms.set(ROOMID, RACEINFO1);
    userInfo.set(USER1, client1);

    const wsHandler = new WsHandler(2, rooms, userInfo, 0);
    wsHandler.start_race(USER1, RACEINFO1);

    const message = { type: 'error', message: 'You do not have permission to start race' };

    await expect(mockServer).toReceiveMessage(JSON.stringify(message));
  });

  it('OwnerDisconnectFromRoomNotStart', async () => {
    mockGetPassage.mockResolvedValue(EXAMPLE_PASSAGE);

    rooms.set(ROOMID, RACEINFOPRIVATE);
    userInfo.set(USER1, client1);
    userInfo.set(USER2, client2);

    const wsHandler = new WsHandler(2, rooms, userInfo, 0);
    wsHandler.disconnect_user_from_room(USER1, RACEINFOPRIVATE);

    const message = { type: 'error', message: 'Room creator disconnected' };

    await expect(mockServer).toReceiveMessage(JSON.stringify(message));
  });

  it('OwnerDisconnectFromRoomStart', async () => {
    mockGetPassage.mockResolvedValue(EXAMPLE_PASSAGE);

    RACEINFOPRIVATE.hasStarted = true;
    rooms.set(ROOMID, RACEINFOPRIVATE);
    userInfo.set(USER1, client1);
    userInfo.set(USER2, client2);

    const wsHandler = new WsHandler(2, rooms, userInfo, 0);
    wsHandler.disconnect_user_from_room(USER1, RACEINFOPRIVATE);

    const message: RaceDataMessage = {
      type: 'raceData',
      raceInfo: {
        owner: USER1,
        roomId: ROOMID,
        hasStarted: true,
        isPublic: false,
        isSolo: false,
        countdownStart,
        raceStart,
        passage: 'TODO',
        users: [USER2],
        userInfo: {
          [USER2]: {
            color: PLAYER_COLORS[1], charsTyped: 0, wpm: 0, finished: false,
          },
        },
      },
    };

    await expect(mockServer).toReceiveMessage(JSON.stringify(message));
  });

  it('ExistingUserTriesToConnectPublic', async () => {
    rooms.set(ROOMID, RACEINFO1);
    userInfo.set(USER1, client1);

    const wsHandler = new WsHandler(2, rooms, userInfo, 0);
    const roomInfo = wsHandler.connect_user_to_public_room(USER1, client2);

    expect(roomInfo).toEqual(undefined);
  });

  it('ExistingUserTriesToRoom', async () => {
    rooms.set(ROOMID, RACEINFO1);
    userInfo.set(USER1, client1);

    const wsHandler = new WsHandler(2, rooms, userInfo, 0);
    const roomInfo = wsHandler.connect_user_to_room(USER1, client2, '');

    expect(roomInfo).toEqual(undefined);
  });

  it('ExistingUserTriesToRoom', async () => {
    const RACEINFO = {
      owner: '',
      roomId: ROOMID,
      hasStarted: false,
      isPublic: true,
      isSolo: false,
      countdownStart,
      raceStart,
      passage: 'TODO',
      users: [],
      userInfo: {
        [USER1]: {
          color: PLAYER_COLORS[0], charsTyped: 0, wpm: 0, finished: false,
        },
      },
    };
    rooms.set(ROOMID, RACEINFO);
    userInfo.set(USER1, client1);

    const wsHandler = new WsHandler(2, rooms, userInfo, 0);
    const roomInfo = wsHandler.connect_user_to_room(USER1, client2, ROOMID);
    expect(wsHandler.rooms.size).toEqual(0);
    expect(roomInfo).toEqual(undefined);
  });

  it('generatesAPassage', async () => {
    mockGetPassage.mockResolvedValue(EXAMPLE_PASSAGE);

    const wsHandler = new WsHandler(1, undefined, undefined, 0);
    const roomId = wsHandler.create_room(true, false);

    /* eslint no-promise-executor-return: "error" */
    await new Promise((res) => {
      setTimeout(() => {
        expect(mockGetPassage.mock.calls.length).toEqual(1);
        const roomInfo = wsHandler.rooms.get(roomId);
        expect(roomInfo?.passage).toEqual(EXAMPLE_PASSAGE.text);
        expect(roomInfo?.passageId).toEqual(EXAMPLE_PASSAGE.id);
        res(0);
      }, 2);
    });
  });
});
