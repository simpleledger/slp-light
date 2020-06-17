import { BigNumber } from 'bignumber.js/bignumber'

export interface Utxo {
    address: Address;
    amount: number;
    index: number;
    txId: string;
    scriptPubKey: string;
    slpToken?: SlpToken;
}

export interface SlpToken {
    slpTokenId: string;
    amount: BigNumber;
    tokenTicker: string;
    transactionType: string;
    tokenType: string;
    slpTokenName: string;
    decimals: number;
}

export interface Address {
    wif?: string
    cashAddress: string;
}

export interface SelectedUtxos {
    utxos: Utxo[];
    change: number;
}