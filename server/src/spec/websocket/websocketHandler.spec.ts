import WsHandler from "../../websockets/websocketHandler";
import { create_handler }  from '../../websockets/createWebsocketConnection';

import WS from 'jest-websocket-mock';
import {WebSocket as MockSocket} from 'mock-socket'

jest.mock('ws', ()=> {
    return {
        WebSocket : jest.fn().mockImplementation(server => { return new MockSocket(server) })
    }
});

import { WebSocket}  from "ws";

describe('WsHandler', function() {
    const fakeURL = 'ws://localhost:8080';
    let mockServer: WS;

    beforeEach(() => {
        mockServer = new WS(fakeURL);
    })

    afterEach (() => {
        WS.clean();
    })

    test("connectUserNewRoom", async () => {
        const client = new WebSocket(fakeURL);
        await mockServer.connected;
        const wsHandler = new WsHandler(1);

        const message = {type: 'users', msg: JSON.stringify([])}
        
        create_handler("j", client, wsHandler);
        
        expect(wsHandler.user_info.size).toEqual(1);
        expect(wsHandler.race_info.size).toEqual(1);
        expect(wsHandler.public_rooms.size).toEqual(1);
        expect(wsHandler.private_rooms.size).toEqual(0);

        await expect(mockServer).toReceiveMessage(JSON.stringify(message));
        mockServer.close();
    })

    test("connectUserExistingRoom", async () => {
        const client1 = new WebSocket(fakeURL);
        await mockServer.connected;
        const client2 = new WebSocket(fakeURL);
        await mockServer.connected;
        
        const public_rooms = new Map<string, string[]>();
        public_rooms.set("1", ["client1"])

        const race_info = new Map<string, boolean>();
        race_info.set("1", false);

        const user_info = new Map<string, WebSocket>();
        user_info.set("client1", client1);

        const wsHandler = new WsHandler(2, public_rooms, undefined, user_info, race_info);
        const message_new = {type: 'users', msg: JSON.stringify(["client1"])}
        const message_rest = {type: 'new_user', msg: "client2"}

        create_handler("client2", client2, wsHandler);

        expect(wsHandler.user_info.size).toEqual(2);
        expect(wsHandler.race_info.size).toEqual(1);
        expect(wsHandler.public_rooms.size).toEqual(1);
        expect(wsHandler.private_rooms.size).toEqual(0);

        await expect(mockServer).toReceiveMessage(JSON.stringify(message_rest));
        await expect(mockServer).toReceiveMessage(JSON.stringify(message_new));
    })

    test("connectUserFullRoom", async () => {
        const client1 = new WebSocket(fakeURL);
        await mockServer.connected;
        const client2 = new WebSocket(fakeURL);
        await mockServer.connected;
        
        const public_rooms = new Map<string, string[]>();
        public_rooms.set("1", ["client1"])

        const race_info = new Map<string, boolean>();
        race_info.set("1", false);

        const user_info = new Map<string, WebSocket>();
        user_info.set("client1", client1);

        const wsHandler = new WsHandler(1, public_rooms, undefined, user_info, race_info);
        const message = {type: 'users', msg: JSON.stringify([])}

        create_handler("client2", client2, wsHandler);

        expect(wsHandler.user_info.size).toEqual(2);
        expect(wsHandler.race_info.size).toEqual(2);
        expect(wsHandler.public_rooms.size).toEqual(2);
        expect(wsHandler.private_rooms.size).toEqual(0);

        await expect(mockServer).toReceiveMessage(JSON.stringify(message));
    })

})
