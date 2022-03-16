import WS from 'jest-websocket-mock';
import { WebSocket as MockSocket } from 'mock-socket';
import { WebSocket } from 'ws';
import WsHandler from '../../websockets/websocketHandler';

jest.mock('ws', () => ({
  WebSocket: jest.fn().mockImplementation((server) => new MockSocket(server)),
}));

const USER1 = 'user1';
const USER2 = 'user2';
const ROOMID = '1';

describe('WsHandler', () => {
  const fakeURL = 'ws://localhost:8080';
  let mockServer: WS;
  let client1: WebSocket;
  let client2: WebSocket;
  let publicRooms: Map<string, string[]>;
  let privateRooms: Map<string, string[]>;
  let userInfo: Map<string, WebSocket>;
  let raceInfo: Map<string, boolean>;

  beforeEach(async () => {
    mockServer = new WS(fakeURL);
    client1 = new WebSocket(fakeURL);
    await mockServer.connected;
    client2 = new WebSocket(fakeURL);
    await mockServer.connected;

    publicRooms = new Map<string, string[]>();
    privateRooms = new Map<string, string[]>();
    raceInfo = new Map<string, boolean>();
    userInfo = new Map<string, WebSocket>();
  });

  afterEach(() => {
    WS.clean();
  });

  it('connectUserNewPublicRoom', async () => {
    const wsHandler = new WsHandler(1);

    const message = { type: 'users', msg: JSON.stringify([]) };

    wsHandler.connect_user_to_room(USER1, client1);

    expect(wsHandler.userInfo.size).toEqual(1);
    expect(wsHandler.raceInfo.size).toEqual(1);
    expect(wsHandler.publicRooms.size).toEqual(1);
    expect(wsHandler.privateRooms.size).toEqual(0);

    await expect(mockServer).toReceiveMessage(JSON.stringify(message));
    mockServer.close();
  });

  it('connectUserNewPrivateRoom', async () => {
    privateRooms.set(ROOMID, []);
    raceInfo.set(ROOMID, false);
    userInfo.set(USER1, client1);

    const wsHandler = new WsHandler(1, undefined, privateRooms, userInfo, raceInfo);
    const message = { type: 'users', msg: JSON.stringify([]) };

    wsHandler.connect_user_to_room(USER1, client1, ROOMID);

    expect(wsHandler.userInfo.size).toEqual(1);
    expect(wsHandler.raceInfo.size).toEqual(1);
    expect(wsHandler.publicRooms.size).toEqual(0);
    expect(wsHandler.privateRooms.size).toEqual(1);

    await expect(mockServer).toReceiveMessage(JSON.stringify(message));
    mockServer.close();
  });

  it('connectUserExistingPublicRoom', async () => {
    publicRooms.set(ROOMID, [USER1]);
    raceInfo.set(ROOMID, false);
    userInfo.set(USER1, client1);

    const wsHandler = new WsHandler(2, publicRooms, undefined, userInfo, raceInfo);
    const messageNew = { type: 'users', msg: JSON.stringify([USER1]) };
    const messageRest = { type: 'new_user', msg: USER2 };

    wsHandler.connect_user_to_room(USER2, client2);

    expect(wsHandler.userInfo.size).toEqual(2);
    expect(wsHandler.raceInfo.size).toEqual(1);
    expect(wsHandler.publicRooms.size).toEqual(1);
    expect(wsHandler.privateRooms.size).toEqual(0);

    await expect(mockServer).toReceiveMessage(JSON.stringify(messageRest));
    await expect(mockServer).toReceiveMessage(JSON.stringify(messageNew));
  });

  it('connectUserExistingPrivateRoom', async () => {
    privateRooms.set(ROOMID, [USER1]);
    raceInfo.set(ROOMID, false);
    userInfo.set(USER1, client1);

    const wsHandler = new WsHandler(2, undefined, privateRooms, userInfo, raceInfo);
    const messageNew = { type: 'users', msg: JSON.stringify([USER1]) };
    const messageRest = { type: 'new_user', msg: USER2 };

    wsHandler.connect_user_to_room(USER2, client2, ROOMID);

    expect(wsHandler.userInfo.size).toEqual(2);
    expect(wsHandler.raceInfo.size).toEqual(1);
    expect(wsHandler.publicRooms.size).toEqual(0);
    expect(wsHandler.privateRooms.size).toEqual(1);

    await expect(mockServer).toReceiveMessage(JSON.stringify(messageRest));
    await expect(mockServer).toReceiveMessage(JSON.stringify(messageNew));
  });

  it('connectUserFullPublicRoom', async () => {
    publicRooms.set(ROOMID, [USER1]);
    raceInfo.set(ROOMID, false);
    userInfo.set(USER1, client1);

    const wsHandler = new WsHandler(1, publicRooms, undefined, userInfo, raceInfo);
    const message = { type: 'users', msg: JSON.stringify([]) };

    wsHandler.connect_user_to_room(USER2, client2);

    expect(wsHandler.userInfo.size).toEqual(2);
    expect(wsHandler.raceInfo.size).toEqual(2);
    expect(wsHandler.publicRooms.size).toEqual(2);
    expect(wsHandler.privateRooms.size).toEqual(0);

    await expect(mockServer).toReceiveMessage(JSON.stringify(message));
  });

  it('connectUserFullPrivateRoom', async () => {
    privateRooms.set(ROOMID, [USER1]);
    raceInfo.set(ROOMID, false);
    userInfo.set(USER1, client1);

    const wsHandler = new WsHandler(1, undefined, privateRooms, userInfo, raceInfo);
    wsHandler.connect_user_to_room(USER2, client2, ROOMID);

    expect(wsHandler.userInfo.size).toEqual(1);
    expect(wsHandler.raceInfo.size).toEqual(1);
    expect(wsHandler.publicRooms.size).toEqual(0);
    expect(wsHandler.privateRooms.size).toEqual(1);
  });

  it('disconnectUserLastInPublicRoom', async () => {
    publicRooms.set(ROOMID, [USER1]);
    raceInfo.set(ROOMID, false);
    userInfo.set(USER1, client1);

    const wsHandler = new WsHandler(1, publicRooms, undefined, userInfo, raceInfo);
    wsHandler.disconnect_user_from_room(USER1, ROOMID);

    expect(wsHandler.userInfo.size).toEqual(0);
    expect(wsHandler.raceInfo.size).toEqual(0);
    expect(wsHandler.publicRooms.size).toEqual(0);
    expect(wsHandler.privateRooms.size).toEqual(0);
  });

  it('disconnectUserLastInPrivateRoom', async () => {
    privateRooms.set(ROOMID, [USER1]);
    raceInfo.set(ROOMID, false);
    userInfo.set(USER1, client1);

    const wsHandler = new WsHandler(2, undefined, privateRooms, userInfo, raceInfo);
    wsHandler.disconnect_user_from_room(USER1, ROOMID);

    expect(wsHandler.userInfo.size).toEqual(0);
    expect(wsHandler.raceInfo.size).toEqual(0);
    expect(wsHandler.publicRooms.size).toEqual(0);
    expect(wsHandler.privateRooms.size).toEqual(0);
  });

  it('disconnectUserInPubicRoom', async () => {
    publicRooms.set(ROOMID, [USER1, USER2]);
    raceInfo.set(ROOMID, false);
    userInfo.set(USER1, client1);
    userInfo.set(USER2, client2);

    const wsHandler = new WsHandler(2, publicRooms, undefined, userInfo, raceInfo);
    const message = { type: 'remove_user', msg: JSON.stringify([USER2]) };

    wsHandler.disconnect_user_from_room(USER1, ROOMID);

    expect(wsHandler.userInfo.size).toEqual(1);
    expect(wsHandler.raceInfo.size).toEqual(1);
    expect(wsHandler.publicRooms.size).toEqual(1);
    expect(wsHandler.privateRooms.size).toEqual(0);

    await expect(mockServer).toReceiveMessage(JSON.stringify(message));
  });

  it('disconnectUserInPrivateRoom', async () => {
    privateRooms.set(ROOMID, [USER1, USER2]);
    raceInfo.set(ROOMID, false);
    userInfo.set(USER1, client1);
    userInfo.set(USER2, client2);

    const wsHandler = new WsHandler(2, undefined, privateRooms, userInfo, raceInfo);
    const message = { type: 'remove_user', msg: JSON.stringify([USER2]) };

    wsHandler.disconnect_user_from_room(USER1, ROOMID);

    expect(wsHandler.userInfo.size).toEqual(1);
    expect(wsHandler.raceInfo.size).toEqual(1);
    expect(wsHandler.publicRooms.size).toEqual(0);
    expect(wsHandler.privateRooms.size).toEqual(1);

    await expect(mockServer).toReceiveMessage(JSON.stringify(message));
  });
});
