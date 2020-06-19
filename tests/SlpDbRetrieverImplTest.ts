import test from 'ava'
import { BitcoinComBchRetriever, BitcoinComRetrieverImpl } from '../src/facade/bitcoincom/BitcoinComRetrieverImpl';
import { retrieveUtxos, selectUtxos, createRawTx } from '../build/main';
import { Address, SelectedUtxos, Utxo } from '../src/utxo/Utxo';
import BigNumber from 'bignumber.js';
import { BchUtxoRetrieverFacade, SlpUtxoRetrieverFacade, UtxoRetrieverFacade } from '../src/facade/UtxoRetrieverFacade';
import { SlpdbRetrieverImpl } from '../src/facade/slpdb/SlpdbRetrieverImpl';

// Example of a combiner between to sources
test("Should succeed fetching utxos", async t => {
    const bchUtxoRetrieverFacade: BchUtxoRetrieverFacade = new BitcoinComBchRetriever();
    const slpUtxoRetrieverFacade: SlpUtxoRetrieverFacade = new SlpdbRetrieverImpl();

    const utxoRetriever: UtxoRetrieverFacade = {
        bchUtxoRetrieverFacade: bchUtxoRetrieverFacade,
        slpUtxoRetrieverFacade: slpUtxoRetrieverFacade,
        getUtxosFromAddress(address: Address): Promise<Utxo[]> {
            bchUtxoRetrieverFacade.getBchUtxosFromAddress(address);
            slpUtxoRetrieverFacade.getSlpUtxosFromAddress(address);
            // COMBINE THEM
            return Promise.resolve([]);
        }
    }
    let utxos = await retrieveUtxos({cashAddress: "bitcoincash:qzm4u38umtw6ak4was24r6ucerkzzxqr5s2328xm0r"}, utxoRetriever);
    t.is(utxos.length, 3)
});