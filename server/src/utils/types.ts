import { User } from '@prisma/client';

export type Powerup = ('rumble'|'whiteout'|'doubletap'|'knockout'| null);

export interface Effect {
    powerupType: Powerup;
    user: string;
    endTime: number;
    target?: string|null;
}

export interface WsUser {
    color: string;
    charsTyped: number;
    wpm: number;
    joinedTime: number;
    finishTime?: Date;
    finished: boolean;
    inventory: Powerup;
    left: boolean;
}

export interface UserWithResults extends User {
    Results: {
        wpm: number;
        count: number;
    }
}

export interface RaceData {
    id?: number;
    roomId: string;
    hasStarted: boolean;
    isPublic: boolean;
    isSolo: boolean;
    countdownStart?: number;
    raceStart?: number;
    passage?: string;
    passageId?: number;
    users: string [];
    userInfo: {[key: string]: WsUser; };
    activeEffects: Effect[];
    owner: string;
}

export interface UserInfo {
    user: string;
    raceInfo: RaceData;
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
    powerup: Powerup;
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

export interface ErrorMessage extends OutMessage {
    type: 'error',
    message: string;
}
