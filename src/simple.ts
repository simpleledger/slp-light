import BigNumber from 'bignumber.js';
import { BITBOX } from 'bitbox-sdk'
import { retrieveUtxos, selectUtxos, createRawTx } from './index';
import { SelectedUtxos, Utxo } from './utxo/Utxo';
import { BitcoinComRetrieverImpl } from './facade/BitcoinComRetrieverImpl';

// simple send mechanism using bitcoin-com
// TODO this should compare against another source for inputs
// or do some sort of pre-validation to prevent burn
export const simpleSend = async (senderWif: string,
                                 receipientAddress: string,
                                 tokenId: string,
                                 tokenAmount: BigNumber): Promise<string> => {
    const bitbox = new BITBOX();

    const ecpair = bitbox.ECPair.fromWIF(senderWif);
    const senderAddress = bitbox.ECPair.toCashAddress(ecpair);

    const utxos = await retrieveUtxos(
        {
            cashAddress: senderAddress,
            wif: senderWif
        },
        new BitcoinComRetrieverImpl()
    );
    console.log('utxos:', utxos);

    const selectedUtxos = selectUtxos(tokenAmount, tokenId, utxos);
    console.log('selectedUtxos:', selectedUtxos);

    const rawTx = createRawTx(
        tokenAmount,
        tokenId,
        receipientAddress,
        senderAddress /* send change back to sender address */,
        selectedUtxos
    );

    const broadcastResult = await bitbox.RawTransactions.sendRawTransaction(rawTx);
    return broadcastResult;
}

