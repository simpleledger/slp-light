import { Address, Utxo } from '../utxo/Utxo';

export interface UtxoRetrieverFacade {
    bchUtxoRetrieverFacade: BchUtxoRetrieverFacade;
    slpUtxoRetrieverFacade: SlpUtxoRetrieverFacade;

    getUtxosFromAddress(address: Address): Promise<Utxo[]>;
}

export interface SlpUtxoRetrieverFacade {
    getSlpUtxosFromAddress: (address: Address) => Promise<Utxo[]>;
}

export interface BchUtxoRetrieverFacade {
    getBchUtxosFromAddress: (address: Address) => Promise<Utxo[]>;
}