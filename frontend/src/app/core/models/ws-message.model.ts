export type WsConnectionState = 'CONNECTING' | 'CONNECTED' | 'DISCONNECTED' | 'ERROR';

export interface WsMessage<T = unknown> {
    topic: string,
    payload: T;
    timestamp: string;
}