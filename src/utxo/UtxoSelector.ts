import { SelectedUtxos, Utxo } from './Utxo';
import BigNumber from 'bignumber.js';

export class UtxoSelector {

    static SATOSHI_DUST_LIMIT: number = 546
    static SATOSHI_PROPAGATION_EXTRA: number = 50
    static SATOSHI_PER_OUTPUT: number = 34
    static SATOSHI_PER_INPUT: number = 148
    static OP_RETURN_NUM_BYTES_BASE: number = 55
    static QUANTITY_NUM_BYTES: number = 9
    static SATOSHI_PER_BYTE: number = 1

    public static selectUtxo(inputUtxos: Utxo[], tokenId: string, sendTokenAmount: BigNumber): SelectedUtxos {
        console.log(`inputs: ${inputUtxos.map(i => i.txId + ":" + i.index)} tokenId: ${tokenId} sendTokenAmount: ${sendTokenAmount}`)
        const slpUtxos = inputUtxos.filter(i => i.slpToken != null);
        const bchUtxos = inputUtxos.filter(i => i.slpToken == null);
        let sendSatoshi = UtxoSelector.SATOSHI_DUST_LIMIT// At least one dust limit output to the token receiver

        let inputSatoshi: number = 0;
        let inputTokensRaw: BigNumber = new BigNumber(0);
        const selectedSlpUtxos = slpUtxos
            .filter(u => u.slpToken.slpTokenId == tokenId)
            .filter(u => ! u.slpToken.hasBaton)
            .sort((a, b) => a.slpToken.amount.comparedTo(b.slpToken.amount));

        const resultUtxo: Utxo[] = [];
        for (let selectedUtxo of selectedSlpUtxos) {
            const amountTooLow = inputTokensRaw.isLessThan(sendTokenAmount);
            if (amountTooLow) {
                inputTokensRaw = inputTokensRaw.plus(selectedUtxo.slpToken.amount)
                inputSatoshi += (selectedUtxo.amount - 148) // Deduct input fee
                resultUtxo.push(selectedUtxo)
            } else {
                break;
            }
        }
        console.log(`Result slps: ${resultUtxo.map(i => i.txId + ":" + i.index)}`);

        if (inputTokensRaw.isLessThan(sendTokenAmount)) {
            throw "Insufficient Funds to pay for token send input=" + inputTokensRaw.toFixed() + " send=" + sendTokenAmount.toFixed();
        } else if (inputTokensRaw.isGreaterThan(sendTokenAmount)) {
            // If there's token change we need at least another dust limit worth of BCH
            sendSatoshi += UtxoSelector.SATOSHI_DUST_LIMIT
        }

        const numOutputs = 3 // Assume three outputs in addition to the op return.
        const numQuanitites = 2 // Assume one token receiver and the token receiver

        const fee: number = (UtxoSelector.SATOSHI_PER_OUTPUT * (numOutputs) + UtxoSelector.opReturnSizeInBytes(numQuanitites) + UtxoSelector.SATOSHI_PROPAGATION_EXTRA) * UtxoSelector.SATOSHI_PER_BYTE

        const sortedBchUtxos = bchUtxos
            .sort((a, b) => a.amount - b.amount);

        for (let sortedBchUtxo of sortedBchUtxos) {
            const amountTooLow = inputSatoshi <= (sendSatoshi + fee)
            if (amountTooLow) {
                inputSatoshi += (sortedBchUtxo.amount - 148) // Deduct input fee
                resultUtxo.push(sortedBchUtxo)
            } else {
                break;
            }
        }

        console.log(`Result bch: ${resultUtxo.map(i => i.txId + ":" + i.index)}`);

        const changeSatoshi = inputSatoshi - sendSatoshi - fee
        if (changeSatoshi < 0) {
            throw "Insufficient Funds to pay for the fee=" + fee + " sendSatoshi=" + sendSatoshi + " inputSatoshi=" + inputSatoshi;
        }

        console.log(`Change sats: ${changeSatoshi}`);

        return {utxos: resultUtxo, change: changeSatoshi};
    }

    private static opReturnSizeInBytes(numQuantities: number): number {
        return UtxoSelector.OP_RETURN_NUM_BYTES_BASE + numQuantities * UtxoSelector.QUANTITY_NUM_BYTES
    }
}
