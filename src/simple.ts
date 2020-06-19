import BigNumber from 'bignumber.js';
import { BITBOX } from 'bitbox-sdk'
import { retrieveBchUtxos, retrieveSlpUtxos, selectUtxos, createRawTx } from './index';
import { SelectedUtxos, Utxo, Address } from './utxo/Utxo';
import { BitcoinComBchRetriever, BitcoinComSlpRetriever } from './facade/bitcoincom/BitcoinComRetrieverImpl';
import { toSlpAddress } from 'bchaddrjs-slp';

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

    const address: Address = {
        cashAddress: senderAddress,
        slpAddress: toSlpAddress(senderAddress),
        wif: senderWif
    };

    const bchUtxos = await retrieveBchUtxos(
        address,
        new BitcoinComBchRetriever()
    );
    console.log('bch utxos:', bchUtxos);

    const slpUtxos = await retrieveSlpUtxos(
        address,
        tokenId,
        new BitcoinComSlpRetriever()
    );
    console.log('slp utxos:', bchUtxos);

    // get distinct utxos from bch and slp lookups
    const utxoMap: Map<string, Utxo> = new Map();
    bchUtxos.concat(slpUtxos).forEach((m) => {
        utxoMap.set(`${m.txId}${m.index}`, m);
    });
    const utxos: Utxo[] = [...utxoMap.values()];

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

