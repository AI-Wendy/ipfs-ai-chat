import { Link, useNavigate } from "react-router-dom";
import LoadingButton from "@mui/lab/LoadingButton";
import { useFormik } from "formik";
import { toast } from "react-toastify";
import * as yup from "yup";
import { useState } from "react";
import { Box, Button, Stack, TextField } from "@mui/material";

import { ApiPromise, WsProvider } from "@polkadot/api";
import { ScProvider } from "@polkadot/rpc-provider/substrate-connect";
import * as Sc from "@substrate/connect";

import { Keyring } from "@polkadot/api";
import { uniqueNamesGenerator, starWars } from "unique-names-generator";
import { cryptoWaitReady, mnemonicGenerate } from "@polkadot/util-crypto";

import {
  web3Accounts,
  web3Enable,
  web3FromAddress,
  web3FromSource,
} from "@polkadot/extension-dapp";


import para_raw from "./para_raw.json";
import polkadot_raw from "./polkadot_raw.json";

const keyring = new Keyring({ type: "sr25519" });

const config = {
  dictionaries: [starWars],
};

export const createKeys = () => {
  const mnemonic = mnemonicGenerate(12);
  const pair = keyring.addFromMnemonic(
    mnemonic,
    { name: uniqueNamesGenerator(config) },
    "sr25519"
  );
  return pair;
};

const loadSpec = () => {
  let spec_b = polkadot_raw;
  spec_b.id = "polkadot-local";
  spec_b.bootNodes.push("/ip4/myhost/tcp/8401/wss/p2p/12D3KooWEBwwWW2ZXsXTaz7hZ8bYgtV8sLL6BG1QmhCF7L7paPCn");
  spec_b.bootNodes.push("/ip4/myhost/tcp/8402/wss/p2p/12D3KooWQMwrJpm7io6zdXwurjUG8eYkmomKnseauCUvquuF9Jwt");
  spec_b.bootNodes.push("/ip4/myhost/tcp/8403/wss/p2p/12D3KooWPsdSMDutYKyxBfJRnTkgFp2wveVijTd2nNUCRUM6d5rv");
  let spec_d = para_raw;
  spec_d.bootNodes.push("/ip4/myhost/tcp/8421/wss/p2p/12D3KooWNLZpD6VLLR9EWuCuKekxPUBCQVDF9Hz1W3NyPNMfiwzb");
  spec_d.bootNodes.push("/ip4/myhost/tcp/8422/wss/p2p/12D3KooWJwJjqZft1afkg7Vt3m65WspYKYA3uVJRKrFbdrvpV7f3");
  console.log(spec_b);
  console.log(spec_d);
  return { spec_b, spec_d };
};

const connectToLayers = async () => {
  const { spec_b, spec_d } = loadSpec();
  const provider0 = new ScProvider(Sc, JSON.stringify(spec_b));
  const provider = new ScProvider(Sc, JSON.stringify(spec_d), provider0);
  await provider.connect();
  const papi = await ApiPromise.create({ provider });
  //let si = [new Signal()];
  //await conPjExt(api, si);
  await papi.rpc.chain.subscribeFinalizedHeads((lastHeader) => {
    console.log(lastHeader);
    //si[0].dispatch(lastHeader);
    //store.todos.pop();
    //store.todos.push({
    //  description: JSON.stringify(lastHeader.hash),
    //  status: "pending",
    //  id: lastHeader.hash,
    //});
  });
  return { papi };
};

const connectToWeb3 = async () => {
  const keys = createKeys();
  const address = keys.address;
  console.log("PCHADDR", address);
  const allInjected = await web3Enable("nn-parachain demo");
  const allAccounts = await web3Accounts();
  const account = allAccounts[0];
  const injector = await web3FromSource(account.meta.source);
  //const SENDER = "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY";
  //const injector = await web3FromAddress(SENDER);
  const wsProvider = new WsProvider("wss://myhost:8121");
  const wapi = await ApiPromise.create({ provider: wsProvider });
  return { wapi };
};

const connectToBlockchain = async () => {
  await cryptoWaitReady();
  const w3con = await connectToWeb3();
  const lcon = await connectToLayers();
  //const lcon = 0;
  return { lcon, w3con };
};

const SigninPage = () => {
  const navigate = useNavigate();

  const [isRequest, setIsRequest] = useState(false);
  const blockchain_ref = useState("blockchain");

  const form = useFormik({
    initialValues: {},
    onSubmit: (values) => onConnect()
  });

  const onConnect = async () => {
    if (isRequest) return;
    setIsRequest(true);

    blockchain_ref[0] = await connectToBlockchain();
    blockchain_ref[1](blockchain_ref[0]);

    //const { response, err } = await userSignIn({ username, password });
    localStorage.setItem("is_conn", true);

    setIsRequest(false);

    const is_conn = localStorage.getItem("is_conn");
    if (is_conn) {
      navigate("/");
    } else {
      toast.error("Connection to blockchain failed");
    }
  };

  return (
    <Box component="form" noValidate onSubmit={form.handleSubmit}>
      <Stack spacing={3}>
        <LoadingButton
          type="submit"
          size="large"
          variant="contained"
          loading={isRequest}
          color="success"
        >
          Connect to blockchain
        </LoadingButton>
      </Stack>
    </Box>
  );
};

export default SigninPage;
