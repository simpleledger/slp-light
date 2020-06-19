import { BigNumber } from 'bignumber.js/bignumber'

export interface Utxo {
    address: Address;
    amount: number;
    index: number;
    txId: string;
    slpToken?: SlpToken;
}

export interface SlpToken {
    slpTokenId: string;
    amount: BigNumber;
    transactionType: string;
    hasBaton: boolean;
}

export interface Address {
    wif?: string
    cashAddress: string;
    slpAddress: string;
}

export interface SelectedUtxos {
    utxos: Utxo[];
    change: number;
}
