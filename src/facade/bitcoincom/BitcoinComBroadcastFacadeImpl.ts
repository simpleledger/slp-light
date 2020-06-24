import { BroadcastFacade } from '../BroadcastFacade';
import Axios from 'axios';

export class BitcoinComBroadcastFacadeImpl implements BroadcastFacade {
    static REST_URL: string = "https://rest.bitcoin.com/v2/rawtransactions/sendRawTransaction/";

    broadcastTransaction(raw: string): Promise<string> {
        return Axios.get(BitcoinComBroadcastFacadeImpl.REST_URL + raw)
            .then(response => {
                return response.data;
            }).catch(er => {
                if (er.response.data.error !== undefined) {
                    return er.response.data.error;
                }
                return "Unknown error";
            })
    }
}