import { BuildTransaction } from './transaction/BuildTransaction';
import { UtxoSelector } from './utxo/UtxoSelector';
import { Address, SelectedUtxos, Utxo } from './utxo/Utxo';
import BigNumber from 'bignumber.js';
import { UtxoRetrieverFacade } from './facade/UtxoRetrieverFacade';

export const createRawTx = (tokenAmount: BigNumber,
                            tokenId: string,
                            sendToAddress: string,
                            changeAddress: string,
                            selectedUtxos: SelectedUtxos): string => {
    return BuildTransaction.createTransaction(tokenAmount, sendToAddress, changeAddress, tokenId, selectedUtxos);
}

export const retrieveUtxos = (address: Address, utxoProvider: UtxoRetrieverFacade): Promise<Utxo[]> => {
    return utxoProvider.getUtxosFromAddress(address);
}

export const selectUtxos = (tokenAmount: BigNumber, tokenId: string, currentUtxos: Utxo[]): SelectedUtxos => {
    return UtxoSelector.selectUtxo(currentUtxos, tokenId, tokenAmount)
}