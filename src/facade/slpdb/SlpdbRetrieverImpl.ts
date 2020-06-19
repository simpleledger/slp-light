import { Address, Utxo } from '../../utxo/Utxo';
import { SlpUtxoRetrieverFacade } from '../UtxoRetrieverFacade';
import { BigNumber } from 'bignumber.js';
import Axios from 'axios';

export class SlpdbRetrieverImpl implements SlpUtxoRetrieverFacade {
    static SLPDB_URL: string = "https://slpdb.fountainhead.cash/";
    private request: string = "https://slpdb.fountainhead.cash/explorer/ewogICJ2IjogMywKICAicSI6IHsKICAgICJhZ2dyZWdhdGUiOiBbCiAgICAgIHsKICAgICAgICAiJG1hdGNoIjogewogICAgICAgICAgImdyYXBoVHhuLmRldGFpbHMudG9rZW5JZEhleCI6ICIyNjgwZjgyODg3NGQ0Y2ZiMDA4YTUzY2MyMGJiOWJhNjE4OGY2MDUzNTZlYTc4NmY1MzExMmM3MmZmZDNkZWMwIiwKICAgICAgICAgICJncmFwaFR4bi5vdXRwdXRzLmFkZHJlc3MiOiAic2ltcGxlbGVkZ2VyOnF6Mm52ODJrY2NzYzlka3BoenJ3MDBqNzVybGo2cGVudmNqZmczZWh0ZCIsCiAgICAgICAgICAiZ3JhcGhUeG4ub3V0cHV0cy5zdGF0dXMiOiAiVU5TUEVOVCIKICAgICAgICB9CiAgICAgIH0sCiAgICAgIHsKICAgICAgICAiJHVud2luZCI6ICIkZ3JhcGhUeG4ub3V0cHV0cyIKICAgICAgfSwKICAgICAgewogICAgICAgICIkbWF0Y2giOiB7CiAgICAgICAgICAiZ3JhcGhUeG4ub3V0cHV0cy5hZGRyZXNzIjogInNpbXBsZWxlZGdlcjpxejJudjgya2Njc2M5ZGtwaHpydzAwajc1cmxqNnBlbnZjamZnM2VodGQiLAogICAgICAgICAgImdyYXBoVHhuLm91dHB1dHMuc3RhdHVzIjogIlVOU1BFTlQiCiAgICAgICAgfQogICAgICB9LAogICAgICB7CiAgICAgICAgIiRwcm9qZWN0IjogewogICAgICAgICAgImdyYXBoVHhuIjogMQogICAgICAgIH0KICAgICAgfQogICAgXSwKICAgICJsaW1pdCI6IDEwCiAgfSwKICAiciI6IHsKICAgICJmIjogIlsgLltdIHwgeyBpbmRleDogLmdyYXBoVHhuLm91dHB1dHMudm91dCwgYW1vdW50OiAuZ3JhcGhUeG4ub3V0cHV0cy5iY2hTYXRvc2hpcywgdHhJZDogLmdyYXBoVHhuLnR4aWQsIGFkZHJlc3M6IC5ncmFwaFR4bi5vdXRwdXRzLmFkZHJlc3MsIHNscFRva2VuOiB7IHNscFRva2VuSWQ6IC5ncmFwaFR4bi5kZXRhaWxzLnRva2VuSWRIZXgsIGFtb3VudDogLmdyYXBoVHhuLm91dHB1dHMuc2xwQW1vdW50LCB0b2tlblR5cGU6IC5ncmFwaFR4bi5kZXRhaWxzLnZlcnNpb25UeXBlLCBoYXNCYXRvbjogZmFsc2UgfSB9IF0iCiAgfQp9";

    getSlpUtxosFromAddress(address: Address, tokenId: string): Promise<Utxo[]> {
        const query = {
            "v": 3,
            "q": {
                "aggregate": [
                    {
                        "$match": {
                            "graphTxn.details.tokenIdHex": tokenId,
                            "graphTxn.outputs.address": address.slpAddress,
                            "graphTxn.outputs.status": "UNSPENT"
                        }
                    },
                    {
                        "$unwind": "$graphTxn.outputs"
                    },
                    {
                        "$match": {
                            "graphTxn.outputs.address": address.slpAddress,
                            "graphTxn.outputs.status": "UNSPENT"
                        }
                    },
                    {
                        "$project": {
                            "graphTxn": 1
                        }
                    }
                ],
                "limit": 1000
            },
            "r": {
                "f": "[ .[] | { vout: .graphTxn.outputs.vout, satoshis: .graphTxn.outputs.bchSatoshis, txid: .graphTxn.txid, address: .graphTxn.outputs.address, tokenId: .graphTxn.details.tokenIdHex, tokenAmount: .graphTxn.outputs.slpAmount, hasBaton: false, tokenDecimal: .token.tokenDetails.decimals, transactionType: .graphTxn.details.transactionType } ]"
            }
        };

        return Axios.get(SlpdbRetrieverImpl.SLPDB_URL+'/q/'+Buffer.from(query).toString('base64'))
            .then((response) => {
                if (response.data == undefined || response.data.g == undefined) {
                    return [];
                }

                return response.data.g.map(r => {
                    const utxo: Utxo = {
                        index: r.vout,
                        amount: r.satoshis,
                        txId: r.txid,
                        address: r.address,
                        slpToken: {
                            slpTokenId: r.tokenId,
                            amount: r.tokenDecimal != 0 ? new BigNumber(r.tokenAmount).shiftedBy(r.tokenDecimal) : new BigNumber(r.tokenAamount),
                            transactionType: r.transactionType,
                            hasBaton: r.hasBaton
                        }
                    }

                    return utxo;
                });
            })
    }
}
