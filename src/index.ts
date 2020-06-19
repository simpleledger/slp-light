import { BuildTransaction } from './transaction/BuildTransaction';
import { UtxoSelector } from './utxo/UtxoSelector';
import { Address, SelectedUtxos, Utxo } from './utxo/Utxo';
import BigNumber from 'bignumber.js';
import { BchUtxoRetrieverFacade, SlpUtxoRetrieverFacade } from './facade/UtxoRetrieverFacade';

export const createRawTx = (tokenAmount: BigNumber,
                            tokenId: string,
                            sendToAddress: string,
                            changeAddress: string,
                            selectedUtxos: SelectedUtxos): string => {
    return BuildTransaction.createTransaction(tokenAmount, sendToAddress, changeAddress, tokenId, selectedUtxos);
}

export const retrieveBchUtxos = (address: Address, utxoProvider: BchUtxoRetrieverFacade): Promise<Utxo[]> => {
    return utxoProvider.getBchUtxosFromAddress(address);
}

export const retrieveSlpUtxos = (address: Address, tokenId: string, utxoProvider: SlpUtxoRetrieverFacade): Promise<Utxo[]> => {
    return utxoProvider.getSlpUtxosFromAddress(address, tokenId);
}

export const selectUtxos = (tokenAmount: BigNumber, tokenId: string, currentUtxos: Utxo[]): SelectedUtxos => {
    return UtxoSelector.selectUtxo(currentUtxos, tokenId, tokenAmount)
}
