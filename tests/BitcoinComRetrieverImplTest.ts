import test from 'ava'
import { BitcoinComRetrieverImpl } from '../src/facade/bitcoincom/BitcoinComRetrieverImpl';
import { retrieveUtxos, selectUtxos, createRawTx } from '../build/main';
import { SelectedUtxos } from '../src/utxo/Utxo';
import BigNumber from 'bignumber.js';

test("Should succeed fetching utxos", async t => {
    let utxos = await retrieveUtxos({cashAddress: "bitcoincash:qzm4u38umtw6ak4was24r6ucerkzzxqr5s2328xm0r"}, new BitcoinComRetrieverImpl());
    t.is(utxos.length, 3)
});

test("Should correctly select utxos", async t => {
    let utxos = await retrieveUtxos({cashAddress: "bitcoincash:qzm4u38umtw6ak4was24r6ucerkzzxqr5s2328xm0r"}, new BitcoinComRetrieverImpl());

    let selectUtxo: SelectedUtxos = selectUtxos(new BigNumber("5"), "323437d4c86b00874c3b00cd454ab6ffb3226130fde09747009cf270caedddcf", utxos);
    t.is(selectUtxo.utxos.length, 3);
});

// This test is not using the correct signing key but instead tests that there are now errors thrown from the createTxMethod
test("Should correctly sign the tx", async t => {
    let utxos = await retrieveUtxos({
        cashAddress: "bitcoincash:qzm4u38umtw6ak4was24r6ucerkzzxqr5s2328xm0r",
        wif: "L4vmKsStbQaCvaKPnCzdRArZgdAxTqVx8vjMGLW5nHtWdRguiRi1"
    }, new BitcoinComRetrieverImpl());
    let selectUtxo: SelectedUtxos = selectUtxos(new BigNumber("5"), "323437d4c86b00874c3b00cd454ab6ffb3226130fde09747009cf270caedddcf", utxos);
    let rawTx = createRawTx(new BigNumber("5"), "dcf128f7f836f369d339963685e91b105cf7982d8977d09f6a776329a6e290e7",
        "bitcoincash:qrve2j5h2f8hy9hlptu7ejltzf4m7fwees60qss5f4",
        "bitcoincash:qzm4u38umtw6ak4was24r6ucerkzzxqr5s2328xm0r",
        selectUtxo);
    console.log(rawTx)
    t.truthy(rawTx);
});
