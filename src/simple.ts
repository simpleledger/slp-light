import BigNumber from 'bignumber.js';
import { ECPair } from 'bitbox-sdk'
import { retrieveBchUtxos, retrieveSlpUtxos, selectUtxos, createRawTx } from './index';
import { Utxo, Address } from './utxo/Utxo';
import { BroadcastFacade } from './facade/BroadcastFacade';
import { SlpUtxoRetrieverFacade, BchUtxoRetrieverFacade } from './facade/UtxoRetrieverFacade';
import { BitcoinComBchRetriever, BitcoinComSlpRetriever } from './facade/bitcoincom/BitcoinComRetrieverImpl';
import { toSlpAddress } from 'bchaddrjs-slp';
import { BitcoinComBroadcastFacadeImpl } from './facade/bitcoincom/BitcoinComBroadcastFacadeImpl';

export interface SimpleConfig {
    slpUtxoRetriever: SlpUtxoRetrieverFacade;
    bchUtxoRetriever: BchUtxoRetrieverFacade;
    broadcaster:      BroadcastFacade;
};

const defaultConfig: SimpleConfig = {
    slpUtxoRetriever: new BitcoinComSlpRetriever(),
    bchUtxoRetriever: new BitcoinComBchRetriever(),
    broadcaster:      new BitcoinComBroadcastFacadeImpl()
};

// simple send mechanism using bitcoin-com
// TODO this should compare against another source for inputs
// or do some sort of pre-validation to prevent burn
export const simpleSend = async (senderWif: string,
                                 receipientAddress: string,
                                 tokenId: string,
                                 tokenAmount: BigNumber,
                                 config: SimpleConfig = defaultConfig
                                ): Promise<string> => {


    const ecpair = new ECPair().fromWIF(senderWif);
    const senderAddress = new ECPair().toCashAddress(ecpair);

    const address: Address = {
        cashAddress: senderAddress,
        slpAddress: toSlpAddress(senderAddress),
        wif: senderWif
    };

    const bchUtxos = await retrieveBchUtxos(address, config.bchUtxoRetriever);
    console.log('bch utxos:', bchUtxos);

    const slpUtxos = await retrieveSlpUtxos(address, tokenId, config.slpUtxoRetriever);
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
    console.log(rawTx)

    return await config.broadcaster.broadcastTransaction(rawTx);
}

