import test from 'ava';
import { retrieveUtxos, selectUtxos, createRawTx } from '../build/main';
import BigNumber from 'bignumber.js';
import { SelectedUtxos, Utxo } from '../src/utxo/Utxo';
import { BitcoinComRetrieverImpl } from '../src/facade/BitcoinComRetrieverImpl';

// This test will start to fail when people steal all the coins.
test("Successfully send a tx", async t => {
    let utxos = await retrieveUtxos({cashAddress: "bitcoincash:qzep8h3rqmx4hfk8rvpd5xhllk2ywyqm6unwjrhdu3",
        wif: "L3urdtRAnAcAr9FXRH1npATrMDzNurSZux6v6dgNPRSsq393V9f7"}, new BitcoinComRetrieverImpl());
    console.log(utxos);
    let selectedUtxos = selectUtxos(new BigNumber("500"), "323437d4c86b00874c3b00cd454ab6ffb3226130fde09747009cf270caedddcf", utxos);
    let rawTx = createRawTx(new BigNumber("500"), "323437d4c86b00874c3b00cd454ab6ffb3226130fde09747009cf270caedddcf", "bitcoincash:qzep8h3rqmx4hfk8rvpd5xhllk2ywyqm6unwjrhdu3",
        "bitcoincash:qzep8h3rqmx4hfk8rvpd5xhllk2ywyqm6unwjrhdu3", selectedUtxos);
    console.log(rawTx);
    t.truthy(rawTx);
});