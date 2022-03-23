import WS from 'jest-websocket-mock';
import { WebSocket as MockSocket } from 'mock-socket';
import { WebSocket } from 'ws';
import WsHandler, { PLAYER_COLORS } from '../../websockets/websocketHandler';
import { RaceData, RaceDataMessage } from '../../utils/types';

jest.mock('ws', () => ({
  WebSocket: jest.fn().mockImplementation((server) => new MockSocket(server)),
}));

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

  const startDate = new Date();

  beforeEach(async () => {
    mockServer = new WS(fakeURL);
    client1 = new WebSocket(fakeURL);
    await mockServer.connected;
    client2 = new WebSocket(fakeURL);
    await mockServer.connected;

    rooms = new Map<string, RaceData>();
    userInfo = new Map<string, WebSocket>();

    USER1 = 'user1';
    USER2 = 'user2';
    ROOMID = '1';
    RACEINFO1 = {
      roomId: ROOMID, hasStarted: false, isPublic: true, start: startDate, passage: 'TODO', users: [USER1], userInfo: { [USER1]: { color: PLAYER_COLORS[0], charsTyped: 0 } },
    };
    RACEINFOFULL1 = {
      roomId: ROOMID, hasStarted: false, isPublic: true, start: startDate, passage: 'TODO', users: [USER1, USER2], userInfo: { [USER1]: { color: PLAYER_COLORS[0], charsTyped: 0 }, [USER2]: { color: PLAYER_COLORS[1], charsTyped: 0 } },
    };
  });

  afterEach(() => {
    WS.clean();
  });

  it('connectUserNewRoom', async () => {
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
    const wsHandler = new WsHandler(1, undefined, undefined, 0);
    const roomId = wsHandler.create_room(true);
    expect(wsHandler.rooms.size).toEqual(1);
    await new Promise (res => setTimeout(() => {
      const raceInfo = wsHandler.rooms.get(roomId);
      expect(raceInfo?.hasStarted).toEqual(true);
      res(0);
    }, 2))    
  });

  it('connectUserFullPublicRoom', async () => {
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

  it('typeChar', async () => {
    rooms.set(ROOMID, RACEINFO1);
    userInfo.set(USER1, client1);

    const wsHandler = new WsHandler(2, rooms, userInfo, 0);
    wsHandler.type_char(1, USER1, RACEINFO1);

    const updatedRaceInfo = {
      roomId: ROOMID, hasStarted: false, isPublic: true, start: startDate, passage: 'TODO', users: [USER1], userInfo: { [USER1]: { color: PLAYER_COLORS[0], charsTyped: 1 } },
    };
    const message: RaceDataMessage = { type: 'raceData', raceInfo: updatedRaceInfo };

    await expect(mockServer).toReceiveMessage(JSON.stringify(message));
  });
});
