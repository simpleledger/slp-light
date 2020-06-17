import { Address, Utxo } from '../utxo/Utxo';

export interface UtxoRetrieverFacade {
    getUtxosFromAddress: (address: Address) => Promise<Utxo[]>;
}
