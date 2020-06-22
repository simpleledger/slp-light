import test from 'ava';
import BigNumber from 'bignumber.js';
import {simpleSend} from "../build/main/simple"


test("Successfully send a tx", async t => {
    for (let i = 0; i < 50; i++) {
        const txId = await simpleSend("Kzm1oz8sLSvuQLEgu99xixSkhNj7kyBZe6TpqTfdgKGhXUeSLSRx",
            "simpleledger:qp2mdqc4r8ylsrnu9f4j5xu8r47m722f6uyfsz4zr6",
            "5f5119b1864711025fddfdd75022299b6758dde9eb485b706cda2e40e2ec6641",
            new BigNumber(Math.floor(Math.random() * 1000) + 100));
        console.log(`RESULT ${txId}`);
        await delay(1000);
    }
});

function delay(ms: number) {
    return new Promise( resolve => setTimeout(resolve, ms) );
}