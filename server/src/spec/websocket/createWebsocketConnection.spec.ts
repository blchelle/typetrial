import WS from 'jest-websocket-mock';
import { WebSocket as MockSocket } from 'mock-socket';
import { WebSocket } from 'ws';
import WsHandler from '../../websockets/websocketHandler';
import { UserInfo } from '../../utils/types';
import { handleMessage } from "../../websockets/createWebsocketConnection";

jest.mock('ws', () => ({
  WebSocket: jest.fn().mockImplementation((server) => new MockSocket(server)),
}));

describe('WsHandler', () => {
  const fakeURL = 'ws://localhost:8080';
  let mockServer: WS;
  let client1: WebSocket;
  let USER1 = 'user1';
  let userInfo: UserInfo

  const startDate = new Date();
  let mockConnectUserToPublicRoom: any;
  let mockConnectUserToRoom: any;
  let mockCreateRoom: any;
  let mockTypeChar: any;
  let mockSendError: any;

  beforeEach(async () => {
    mockConnectUserToPublicRoom = jest
    .spyOn(WsHandler.prototype, 'connect_user_to_public_room')
    .mockImplementation(() => {
      return {
        roomId: "", hasStarted: false, isPublic: true, start: startDate, passage: '', users: [], userInfo: {},
      };
    });

    mockConnectUserToRoom = jest
    .spyOn(WsHandler.prototype, 'connect_user_to_room')
    .mockImplementation(() => {
      return {
        roomId: "", hasStarted: false, isPublic: true, start: startDate, passage: '', users: [], userInfo: {},
      };
    });

    mockCreateRoom = jest
    .spyOn(WsHandler.prototype, 'create_room')
    .mockImplementation(() => {
      return ""
    });

    mockTypeChar = jest
    .spyOn(WsHandler.prototype, 'type_char')
    .mockImplementation(() => {
      return 0
    });

    mockServer = new WS(fakeURL);
    client1 = new WebSocket(fakeURL);
    await mockServer.connected;

    userInfo = {user: USER1, raceInfo: {
      roomId: "", hasStarted: false, isPublic: true, start: startDate, passage: '', users: [], userInfo: {},
    }}
  });

  afterEach(() => {
    WS.clean();
  });

  it('connectToPublicRoomMessageHandling', async () => {
    const wsHandler = new WsHandler(1);
    handleMessage(wsHandler, userInfo, client1, {type: 'connect_public'});
    expect(mockConnectUserToPublicRoom).toBeCalled();
    expect(mockConnectUserToRoom).not.toBeCalled();
    expect(mockCreateRoom).not.toBeCalled();
    expect(mockTypeChar).not.toBeCalled();
  });

  it('connectToRoomMessageHandling', async () => {
    const wsHandler = new WsHandler(1);
    handleMessage(wsHandler, userInfo, client1, {type: 'connect_private'});
    expect(mockConnectUserToPublicRoom).not.toBeCalled();
    expect(mockConnectUserToRoom).toBeCalled();
    expect(mockCreateRoom).not.toBeCalled();
    expect(mockTypeChar).not.toBeCalled();
  });

  it('connectToPrivateRoomMessageHandling', async () => {
    const wsHandler = new WsHandler(1);
    handleMessage(wsHandler, userInfo, client1, {type: 'connect_private', roomId: ""});
    expect(mockConnectUserToPublicRoom).not.toBeCalled();
    expect(mockConnectUserToRoom).toBeCalled();
    expect(mockCreateRoom).not.toBeCalled();
    expect(mockTypeChar).not.toBeCalled();
  });

  it('createRoomMessageHandling', async () => {
    const wsHandler = new WsHandler(1);
    handleMessage(wsHandler, userInfo, client1, {type: 'create_private'});
    expect(mockConnectUserToPublicRoom).not.toBeCalled();
    expect(mockConnectUserToRoom).toBeCalled();
    expect(mockCreateRoom).toBeCalled();
    expect(mockTypeChar).not.toBeCalled();
  });

  it('InvalidInMessage', async () => {
    const wsHandler = new WsHandler(1);
    handleMessage(wsHandler, userInfo, client1, {});
    expect(mockConnectUserToPublicRoom).not.toBeCalled();
    expect(mockConnectUserToRoom).not.toBeCalled();
    expect(mockCreateRoom).not.toBeCalled();
    expect(mockTypeChar).not.toBeCalled();
    expect(mockSendError).toBeCalled();
  });

  // it('connectUserExistingRoom', async () => {
  //   rooms.set(ROOMID, RACEINFO1);
  //   userInfo.set(USER1, client1);

  //   const wsHandler = new WsHandler(2, rooms, userInfo);
  //   wsHandler.connect_user_to_public_room(USER2, client2);

  //   expect(wsHandler.userInfo.size).toEqual(2);
  //   expect(wsHandler.rooms.size).toEqual(1);

  //   const message: RaceDataMessage = { type: 'raceData', raceInfo: RACEINFOFULL1 };

  //   await expect(mockServer).toReceiveMessage(JSON.stringify(message));
  //   await expect(mockServer).toReceiveMessage(JSON.stringify(message));

  //   mockServer.close();
  // });

  // it('createNewRoom', () => {
  //   const wsHandler = new WsHandler(1);
  //   wsHandler.create_room(false);
  //   expect(wsHandler.rooms.size).toEqual(1);
  // });

  // it('connectUserFullPublicRoom', async () => {
  //   rooms.set(ROOMID, RACEINFO1);
  //   userInfo.set(USER1, client1);

  //   const wsHandler = new WsHandler(1, rooms, userInfo);

  //   wsHandler.connect_user_to_public_room(USER2, client2);

  //   expect(wsHandler.userInfo.size).toEqual(2);
  //   expect(wsHandler.rooms.size).toEqual(2);

  //   const message: RaceDataMessage = { type: 'raceData', raceInfo: RACEINFOFULL1 };
  //   await expect(mockServer).not.toReceiveMessage(JSON.stringify(message));
  // });

  // it('disconnectUserLastInRoom', async () => {
  //   rooms.set(ROOMID, RACEINFO1);
  //   userInfo.set(USER1, client1);

  //   const wsHandler = new WsHandler(1, rooms, userInfo);
  //   wsHandler.disconnect_user_from_room(USER1, RACEINFO1);

  //   expect(wsHandler.userInfo.size).toEqual(0);
  //   expect(wsHandler.rooms.size).toEqual(0);
  // });

  // it('disconnectUserRoom', async () => {
  //   rooms.set(ROOMID, RACEINFOFULL1);
  //   userInfo.set(USER1, client1);
  //   userInfo.set(USER2, client2);

  //   const wsHandler = new WsHandler(2, rooms, userInfo);
  //   wsHandler.disconnect_user_from_room(USER2, RACEINFOFULL1);

  //   expect(wsHandler.userInfo.size).toEqual(1);
  //   expect(wsHandler.rooms.size).toEqual(1);

  //   const message: RaceDataMessage = { type: 'raceData', raceInfo: RACEINFO1 };
  //   await expect(mockServer).toReceiveMessage(JSON.stringify(message));
  // });

  // it('typeChar', async () => {
  //   rooms.set(ROOMID, RACEINFO1);
  //   userInfo.set(USER1, client1);

  //   const wsHandler = new WsHandler(2, rooms, userInfo);
  //   wsHandler.type_char(1, USER1, RACEINFO1);

  //   const updatedRaceInfo = {
  //     roomId: ROOMID, hasStarted: false, isPublic: true, start: startDate, passage: 'TODO', users: [USER1], userInfo: { [USER1]: { color: PLAYER_COLORS[0], charsTyped: 1 } },
  //   };
  //   const message: RaceDataMessage = { type: 'raceData', raceInfo: updatedRaceInfo };

  //   await expect(mockServer).toReceiveMessage(JSON.stringify(message));
  // });
});
