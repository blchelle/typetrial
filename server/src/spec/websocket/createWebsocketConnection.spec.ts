import WS from 'jest-websocket-mock';
import { WebSocket as MockSocket } from 'mock-socket';
import { WebSocket } from 'ws';
import WsHandler from '../../websockets/websocketHandler';
import { UserInfo } from '../../utils/types';
import * as createConnection from '../../websockets/createWebsocketConnection';

jest.mock('ws', () => ({
  WebSocket: jest.fn().mockImplementation((server) => new MockSocket(server)),
}));

describe('WsHandler', () => {
  const fakeURL = 'ws://localhost:8080';
  let mockServer: WS;
  let client1: WebSocket;
  const USER1 = 'user1';
  let userInfo: UserInfo;
  let mockSendError: any;

  const countdownStart = new Date().getTime();
  const raceStart = countdownStart + 1000;
  let mockConnectUserToPublicRoom: any;
  let mockConnectUserToRoom: any;
  let mockCreateRoom: any;
  let mockTypeChar: any;
  let mockStartRace: any;

  beforeEach(async () => {
    mockSendError = jest.spyOn(createConnection, 'sendError').mockImplementation(() => {});

    mockStartRace = jest
      .spyOn(WsHandler.prototype, 'start_race')
      .mockImplementation(() => {});

    mockConnectUserToPublicRoom = jest
      .spyOn(WsHandler.prototype, 'connect_user_to_public_room')
      .mockImplementation(() => ({
        owner: '', roomId: '', hasStarted: false, isPublic: true, isSolo: false, countdownStart, raceStart, passage: '', users: [], userInfo: {}, activeEffects: [],
      }));

    mockConnectUserToRoom = jest
      .spyOn(WsHandler.prototype, 'connect_user_to_room')
      .mockImplementation(() => ({
        owner: '', roomId: '', hasStarted: false, isPublic: true, isSolo: false, countdownStart, raceStart, passage: '', users: [], userInfo: {}, activeEffects: [],
      }));

    mockCreateRoom = jest
      .spyOn(WsHandler.prototype, 'create_room')
      .mockImplementation(() => '');

    mockTypeChar = jest
      .spyOn(WsHandler.prototype, 'type_char')
      .mockImplementation(() => 0);

    mockServer = new WS(fakeURL);
    client1 = new WebSocket(fakeURL);
    await mockServer.connected;

    userInfo = {
      user: USER1,
      raceInfo: {
        owner: '', roomId: '', hasStarted: false, isPublic: true, isSolo: false, countdownStart, raceStart, passage: '', users: [], userInfo: {}, activeEffects: [],
      },
    };
  });

  afterEach(() => {
    WS.clean();
    mockSendError.mockReset;
  });

  it('connectToPublicRoomMessageHandling', async () => {
    const wsHandler = new WsHandler(1);
    createConnection.handleMessage(wsHandler, userInfo, client1, JSON.stringify({ type: 'connect_public' }));
    expect(mockConnectUserToPublicRoom).toBeCalled();
    expect(mockConnectUserToRoom).not.toBeCalled();
    expect(mockCreateRoom).not.toBeCalled();
    expect(mockTypeChar).not.toBeCalled();
    expect(mockStartRace).not.toBeCalled();
    expect(mockSendError).not.toBeCalled();
  });

  it('connectToRoomMessageHandling', async () => {
    const wsHandler = new WsHandler(1);
    createConnection.handleMessage(wsHandler, userInfo, client1, JSON.stringify({ type: 'connect_private' }));
    expect(mockConnectUserToPublicRoom).not.toBeCalled();
    expect(mockConnectUserToRoom).toBeCalled();
    expect(mockCreateRoom).not.toBeCalled();
    expect(mockTypeChar).not.toBeCalled();
    expect(mockStartRace).not.toBeCalled();
    expect(mockSendError).not.toBeCalled();
  });

  it('connectToPrivateRoomMessageHandling', async () => {
    const wsHandler = new WsHandler(1);
    createConnection.handleMessage(wsHandler, userInfo, client1, JSON.stringify({ type: 'connect_private', roomId: '' }));
    expect(mockConnectUserToPublicRoom).not.toBeCalled();
    expect(mockConnectUserToRoom).toBeCalled();
    expect(mockCreateRoom).not.toBeCalled();
    expect(mockTypeChar).not.toBeCalled();
    expect(mockStartRace).not.toBeCalled();
    expect(mockSendError).not.toBeCalled();
  });

  it('createRoomMessageHandling', async () => {
    const wsHandler = new WsHandler(1);
    createConnection.handleMessage(wsHandler, userInfo, client1, JSON.stringify({ type: 'create_private' }));
    expect(mockConnectUserToPublicRoom).not.toBeCalled();
    expect(mockConnectUserToRoom).toBeCalled();
    expect(mockCreateRoom).toBeCalled();
    expect(mockTypeChar).not.toBeCalled();
    expect(mockStartRace).not.toBeCalled();
    expect(mockSendError).not.toBeCalled();
  });

  it('typeMessageHandling', async () => {
    const wsHandler = new WsHandler(1);
    createConnection.handleMessage(wsHandler, userInfo, client1, JSON.stringify({ type: 'type', charsTyped: 0 }));
    expect(mockConnectUserToPublicRoom).not.toBeCalled();
    expect(mockConnectUserToRoom).not.toBeCalled();
    expect(mockCreateRoom).not.toBeCalled();
    expect(mockTypeChar).toBeCalled();
    expect(mockStartRace).not.toBeCalled();
    expect(mockSendError).not.toBeCalled();
  });

  it('startMessageHandling', async () => {
    const wsHandler = new WsHandler(1);
    createConnection.handleMessage(wsHandler, userInfo, client1, JSON.stringify({ type: 'start' }));
    expect(mockConnectUserToPublicRoom).not.toBeCalled();
    expect(mockConnectUserToRoom).not.toBeCalled();
    expect(mockCreateRoom).not.toBeCalled();
    expect(mockTypeChar).not.toBeCalled();
    expect(mockStartRace).toBeCalled();
    expect(mockSendError).not.toBeCalled();
  });

  it('InvalidInMessage', async () => {
    const wsHandler = new WsHandler(1);
    createConnection.handleMessage(wsHandler, userInfo, client1, JSON.stringify({}));
    expect(mockConnectUserToPublicRoom).not.toBeCalled();
    expect(mockConnectUserToRoom).not.toBeCalled();
    expect(mockCreateRoom).not.toBeCalled();
    expect(mockTypeChar).not.toBeCalled();
    expect(mockStartRace).not.toBeCalled();
    expect(mockSendError).toBeCalled();
  });

  it('noPublicRoomFound', async () => {
    mockConnectUserToPublicRoom = jest
      .spyOn(WsHandler.prototype, 'connect_user_to_public_room')
      .mockImplementation(() => undefined);
    const wsHandler = new WsHandler(1);
    createConnection.handleMessage(wsHandler, userInfo, client1, JSON.stringify({ type: 'connect_public' }));
    expect(mockConnectUserToPublicRoom).toBeCalled();
    expect(mockConnectUserToRoom).not.toBeCalled();
    expect(mockCreateRoom).not.toBeCalled();
    expect(mockTypeChar).not.toBeCalled();
    expect(mockStartRace).not.toBeCalled();
    expect(mockSendError).toBeCalled();
  });

  it('noPrivateRoomFound', async () => {
    mockConnectUserToRoom = jest
      .spyOn(WsHandler.prototype, 'connect_user_to_room')
      .mockImplementation(() => undefined);
    const wsHandler = new WsHandler(1);
    createConnection.handleMessage(wsHandler, userInfo, client1, JSON.stringify({ type: 'connect_private', roomId: '' }));
    expect(mockConnectUserToPublicRoom).not.toBeCalled();
    expect(mockConnectUserToRoom).toBeCalled();
    expect(mockCreateRoom).not.toBeCalled();
    expect(mockTypeChar).not.toBeCalled();
    expect(mockStartRace).not.toBeCalled();
    expect(mockSendError).toBeCalled();
  });

  it('failCreateRoom', async () => {
    mockConnectUserToRoom = jest
      .spyOn(WsHandler.prototype, 'connect_user_to_room')
      .mockImplementation(() => undefined);
    const wsHandler = new WsHandler(1);
    createConnection.handleMessage(wsHandler, userInfo, client1, JSON.stringify({ type: 'create_private' }));
    expect(mockConnectUserToPublicRoom).not.toBeCalled();
    expect(mockConnectUserToRoom).toBeCalled();
    expect(mockCreateRoom).toBeCalled();
    expect(mockTypeChar).not.toBeCalled();
    expect(mockStartRace).not.toBeCalled();
    expect(mockSendError).toBeCalled();
  });

  it('InvalidCastToConnectPrivate', async () => {
    jest.spyOn(createConnection, 'safeCast').mockImplementation(() => undefined);
    const wsHandler = new WsHandler(1);
    createConnection.handleMessage(wsHandler, userInfo, client1, JSON.stringify({ type: 'connect_private' }));
    expect(mockConnectUserToPublicRoom).not.toBeCalled();
    expect(mockConnectUserToRoom).not.toBeCalled();
    expect(mockCreateRoom).not.toBeCalled();
    expect(mockTypeChar).not.toBeCalled();
    expect(mockStartRace).not.toBeCalled();
    expect(mockSendError).toBeCalled();
  });

  it('InvalidCastToTypedMessage', async () => {
    jest.spyOn(createConnection, 'safeCast').mockImplementation(() => undefined);
    const wsHandler = new WsHandler(1);
    createConnection.handleMessage(wsHandler, userInfo, client1, JSON.stringify({ type: 'type' }));
    expect(mockConnectUserToPublicRoom).not.toBeCalled();
    expect(mockConnectUserToRoom).not.toBeCalled();
    expect(mockCreateRoom).not.toBeCalled();
    expect(mockTypeChar).not.toBeCalled();
    expect(mockStartRace).not.toBeCalled();
    expect(mockSendError).toBeCalled();
  });

  it('testDisconnect', async () => {
    const mockDisconnect = jest
      .spyOn(WsHandler.prototype, 'disconnect_user_from_room')
      .mockImplementation(() => {});
    const wsHandler = new WsHandler(1);
    createConnection.createHandler(USER1, client1, wsHandler, true);
    mockServer.close();
    expect(mockDisconnect).toBeCalled();
  });
});
