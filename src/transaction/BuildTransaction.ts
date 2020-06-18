import { BN, TokenType1 } from 'slp-mdm';
import { SelectedUtxos, Utxo } from '../utxo/Utxo';
import { BITBOX } from 'bitbox-sdk'
import BigNumber from 'bignumber.js';

const bitbox = new BITBOX();

export class BuildTransaction {
    static DUST_OUTPUT: number = 546;

    public static createTransaction(sendTokenAmount: BigNumber,
                                    sendToAddress: string,
                                    changeAddress: string,
                                    tokenId: string,
                                    selectedUtxos: SelectedUtxos): string {
        if (sendTokenAmount === undefined || sendToAddress === undefined || changeAddress === undefined || tokenId === undefined) {
            throw "Input is incorrect";
        }

        const transactionBuilder = new bitbox.TransactionBuilder("bitcoincash");

        const tokenChangeAmount = this.getTokenChangeAmount(tokenId, sendTokenAmount, selectedUtxos.utxos);

        transactionBuilder.addOutput(this.createOpReturn(tokenId, sendTokenAmount, tokenChangeAmount), 0);
        // TODO to handle inputs > 64bit we need to add additional outputs to fulfill
        transactionBuilder.addOutput(sendToAddress, BuildTransaction.DUST_OUTPUT);

        if (tokenChangeAmount.isGreaterThan(0)) {
            transactionBuilder.addOutput(changeAddress, BuildTransaction.DUST_OUTPUT);
        }
        if (selectedUtxos.change >= BuildTransaction.DUST_OUTPUT) {
            transactionBuilder.addOutput(changeAddress, selectedUtxos.change);
        }

        selectedUtxos.utxos.forEach(input => transactionBuilder.addInput(input.txId, input.index));
        for (let i = 0; i < selectedUtxos.utxos.length; i++) {
            const input = selectedUtxos.utxos[i];
            const ecPair = bitbox.ECPair.fromWIF(input.address.wif);

            transactionBuilder.sign(
                i,
                ecPair,
                undefined,
                transactionBuilder.hashTypes.SIGHASH_ALL,
                input.amount
            );
        }

        return transactionBuilder.build().toHex()
    }

    private static createOpReturn(tokenId: string, tokenAmount: BigNumber, tokenChangeAmount: BigNumber): Buffer {
        const slpAmounts: BN[] = [new BN(tokenAmount.toFixed())];
        if (tokenChangeAmount.isGreaterThan(0)) {
            slpAmounts.push(new BN(tokenChangeAmount.toFixed()));
        }
        return TokenType1.send(tokenId, slpAmounts);
    }

    private static getTokenChangeAmount(tokenId: string, tokenAmount: BigNumber, utxos: Utxo[]): BigNumber {
        const totalUtxoTokenValue: BigNumber = utxos
            .filter(u => u.slpToken != null)
            .map(u => u.slpToken)
            .map(u => u.amount)
            .reduce((a, b) => a.plus(b))
        return totalUtxoTokenValue.minus(tokenAmount);
    }
}
