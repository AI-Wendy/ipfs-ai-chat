import { ApiPromise, WsProvider } from "@polkadot/api";
import { stringToHex, hexToString } from '@polkadot/util';

const ConnectToMiner = async () => {
  const wsProvider = new WsProvider("wss://myhost:8121");
  const mapi = await ApiPromise.create({
    provider: wsProvider,
    rpc: {
      nn: {
        compute_out: {
          description: "NN Compute Out",
          params: [
            {
              name: "input",
              type: "Bytes",
            },
          ],
          type: "Bytes",
        },
      },
    },
  });
  console.log("Connected to miner");
  return mapi;
};

export const chatCompletion = async ({ prompt, mapi_ref }) => {
  try {
    if (mapi_ref[0] == "mapi_ref") {
      mapi_ref[0] = await ConnectToMiner();
      mapi_ref[1](mapi_ref[0]);
    }
    let inp = stringToHex(prompt);
    const out = await mapi_ref[0].rpc.nn.compute_out(inp);
    console.log("OUT", out);
    const response = { text: hexToString(out + "") };

    return { response };
  } catch (err) {
    return { err };
  }
};
