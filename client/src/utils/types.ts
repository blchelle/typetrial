export type Powerup = ('rumble'|'whiteout'|'doubletap'|'knockout'| null);

export interface User {
    color: string;
    charsTyped: number;
    wpm: number;
    finishTime?: Date;
    finished: boolean;
    inventory: Powerup;
}

export interface RaceData {
    roomId: string,
    hasStarted: boolean,
    isPublic: boolean,
    isSolo: boolean,
    countdownStart?: number,
    raceStart?: number,
    passage?: string,
    users: string [],
    userInfo: {[key: string]: User; },
    owner: string,
}

export interface Message {
    type: string;
}

export interface OutMessage extends Message{

}

export interface InMessage extends Message{

}

export interface RaceDataMessage extends OutMessage {
    type: 'raceData';
    raceInfo: RaceData;
}

export interface RaceUpdateMessage extends OutMessage {
    type: 'update';
    update: any;
}

export interface UsePowerupMessage extends InMessage {
    type: 'powerup';
    powerup: string;
}

export interface ConnectPublicMessage extends InMessage {
    type: 'connect_public';
    public: boolean;
}

export interface ConnectPrivateMessage extends InMessage {
    type: 'connect_private';
    public: boolean;
    roomId: string;
}

export interface CreatePrivateMessage extends InMessage {
    type: 'create_private';
    public: boolean;
    solo: boolean;
}

export interface StartMessage extends InMessage {
    type: 'start';
}

export interface TypeMessage extends InMessage {
    type: 'type';
    charsTyped: number;
}

export interface ErrorMessage extends InMessage {
    type: 'error';
    message: string;
}
