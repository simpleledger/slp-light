import test from 'ava';
import BigNumber from 'bignumber.js';
import {simpleSend} from "../build/main/simple"


test("Successfully send a tx", async t => {
    for (let i = 0; i < 50; i++) {
        const txId = await simpleSend("Kzm1oz8sLSvuQLEgu99xixSkhNj7kyBZe6TpqTfdgKGhXUeSLSRx",
            "simpleledger:qp2mdqc4r8ylsrnu9f4j5xu8r47m722f6uyfsz4zr6",
            "323437d4c86b00874c3b00cd454ab6ffb3226130fde09747009cf270caedddcf",
            new BigNumber(Math.floor(Math.random() * 1000) + 100));
        console.log(`RESULT ${txId}`);
        await delay(1000);
    }
});

function delay(ms: number) {
    return new Promise( resolve => setTimeout(resolve, ms) );
}