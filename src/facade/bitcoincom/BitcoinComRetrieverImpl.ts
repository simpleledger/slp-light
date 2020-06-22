import { Address, Utxo } from '../../utxo/Utxo';
import Axios from 'axios';
import { BigNumber } from 'bignumber.js';
import { BchUtxoRetrieverFacade, SlpUtxoRetrieverFacade } from '../UtxoRetrieverFacade';


export class BitcoinComBchRetriever implements BchUtxoRetrieverFacade {
    static FULL_INDEXER_URL: string = "https://explorer.api.bitcoin.com/";

    public getBchUtxosFromAddress = (address: Address): Promise<Utxo[]> => {
        return Axios.post(BitcoinComBchRetriever.FULL_INDEXER_URL + "bch/v1/addrs/utxo", {
            addrs: address.cashAddress
        }).then(response => {
            if (response.data == undefined) {
                return [];
            }
            return response.data.map(r => {
                const utxo: Utxo = {
                    index: r.vout,
                    txId: r.txid,
                    amount: r.satoshis,
                    address: address
                }
                return utxo;
            })
        });
    }
}

export class BitcoinComSlpRetriever implements SlpUtxoRetrieverFacade {
    static SLP_INDEXER_URL: string = "https://rest.bitcoin.com/";

    public getSlpUtxosFromAddress = (address: Address, tokenId: string): Promise<Utxo[]> => {
        return Axios.get(BitcoinComSlpRetriever.SLP_INDEXER_URL + "v3/slp/utxo/address/" + address.cashAddress).then(response => {
            if (response.data == undefined) {
                return [];
            }
            return response.data.map(r => {
                const utxo: Utxo = {
                    index: r.vout,
                    amount: r.satoshis,
                    txId: r.txId,
                    address: address,
                    slpToken: {
                        slpTokenId: r.slpTokenId,
                        amount: r.tokenDecimal != 0 ? new BigNumber(r.tokenAmount).shiftedBy(r.tokenDecimal) : new BigNumber(r.tokenAmount),
                        transactionType: r.transactionType,
                        hasBaton: r.hasBaton
                    }
                };
                return utxo;
            });
        });
    }
}
