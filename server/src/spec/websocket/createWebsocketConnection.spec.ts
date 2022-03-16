import WS from 'jest-websocket-mock';
import { WebSocket as MockSocket } from 'mock-socket';
import { WebSocket } from 'ws';
import { expect, afterEach } from '@jest/globals';
import WsHandler from '../../websockets/websocketHandler';
import { createHandler } from '../../websockets/createWebsocketConnection';

jest.mock('ws', () => ({
  WebSocket: jest.fn().mockImplementation((server) => new MockSocket(server)),
}));

const USER1 = 'user1';
let connectMock: jest.SpyInstance<string | undefined, [user: string, ws: WebSocket, roomid?: string | undefined]>;
let disconnectMock:jest.SpyInstance<void, [user: string, roomid: string]>;

describe('WsHandler', () => {
  const fakeURL = 'ws://localhost:8080';
  let mockServer: WS;
  let client: WebSocket;

  beforeEach(async () => {
    mockServer = new WS(fakeURL);
    client = new WebSocket(fakeURL);
    await mockServer.connected;

    connectMock = jest
      .spyOn(WsHandler.prototype, 'connect_user_to_room')
      .mockImplementation(() => '1');

    disconnectMock = jest
      .spyOn(WsHandler.prototype, 'disconnect_user_from_room')
      .mockImplementation((user) => user);
  });

  afterEach(() => {
    WS.clean();
  });

  it('connectUserNewPublicRoom', async () => {
    createHandler(USER1, client, new WsHandler(1));
    expect(connectMock).toHaveBeenCalled();
  });

  it('connectUserNewPublicRoom', async () => {
    createHandler(USER1, client, new WsHandler(1));
    mockServer.close();
    expect(disconnectMock).toHaveBeenCalled();
  });
});
