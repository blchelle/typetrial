export interface RaceData {
    roomId: string,
    hasStarted: boolean,
    isPublic: boolean,
    start: Date,
    passage: string
    users: string []
}

export interface Message {
    type: string;
    msg: string;
}