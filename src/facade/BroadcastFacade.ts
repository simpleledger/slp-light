export interface BroadcastFacade {
    broadcastTransaction(raw: string): Promise<string>;
}