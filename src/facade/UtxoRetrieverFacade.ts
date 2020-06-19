import { Address, Utxo } from '../utxo/Utxo';

export interface SlpUtxoRetrieverFacade {
    getSlpUtxosFromAddress: (address: Address, tokenId: string) => Promise<Utxo[]>;
}

export interface BchUtxoRetrieverFacade {
    getBchUtxosFromAddress: (address: Address) => Promise<Utxo[]>;
}
