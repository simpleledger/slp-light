import { Address, Utxo } from '../../utxo/Utxo';
import { BchUtxoRetrieverFacade } from '../UtxoRetrieverFacade';

export class ElectrumXRetriever implements BchUtxoRetrieverFacade {

    getBchUtxosFromAddress(address: Address): Promise<Utxo[]> {
        return Promise.resolve([]);
    }
}