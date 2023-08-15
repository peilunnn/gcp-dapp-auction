import React, { useCallback, useReducer, useState } from "react";
import Web3 from "web3";
import EthContext from "./EthContext";
import { actions, initialState, reducer } from "./state";
import { WALLET_ADAPTERS, CHAIN_NAMESPACES } from "@web3auth/base";
import { Web3AuthNoModal } from "@web3auth/no-modal";
import { OpenloginAdapter } from "@web3auth/openlogin-adapter";
import { EthereumPrivateKeyProvider } from "@web3auth/ethereum-provider";
import { GoogleAuthProvider, getAuth, signInWithPopup } from "firebase/auth";
import { initializeApp } from "firebase/app";

const env = process.env.REACT_APP_ENV;
const targetChainName = process.env.REACT_APP_CHAIN_NAME;
const targetChainId = process.env.REACT_APP_CHAIN_ID;
const targetRpcUrl = process.env.REACT_APP_RPC_URL;
const bneApiKey = process.env.REACT_APP_BNE_API_KEY;
const web3AuthClientId = process.env.REACT_APP_WEB3AUTH_CLIENT_ID;
const openLoginJwtName = "gcp-dapp-auction-jwt";
const web3authVerifier = "gcp-dapp-auction-web3auth-verifier";
const developmentDomain = "http://localhost:3000/auction";
const stagingDomain = "https://nftauctionhouse.net/auction";

const auctionFactoryJson = require("../../contracts/AuctionFactory.json");

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: "saib-sandbox.firebaseapp.com",
  databaseURL: "https://saib-sandbox-default-rtdb.firebaseio.com",
  projectId: "saib-sandbox",
  storageBucket: "saib-sandbox.appspot.com",
  messagingSenderId: "27583321828",
  appId: "1:27583321828:web:4af56ec23fc042b90c7ef1",
  measurementId: "G-RW9707JQCS",
};

const chainConfig = {
  chainId: targetChainId,
  displayName: targetChainName,
  chainNamespace: CHAIN_NAMESPACES.EIP155,
  tickerName: targetChainName,
  ticker: "ETH",
  decimals: 18,
  rpcTarget: env === "development" ? targetRpcUrl : `${targetRpcUrl}?key=${bneApiKey}`,
  blockExplorer: "https://etherscan.io",
};

console.log(process.env);
console.log(chainConfig);

function EthProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [web3auth, setWeb3auth] = useState(null);

  const signInWithGoogle = async () => {
    try {
      const app = initializeApp(firebaseConfig);
      const auth = getAuth(app);
      const googleProvider = new GoogleAuthProvider();
      const res = await signInWithPopup(auth, googleProvider);
      return res;
    } catch (err) {
      console.log(err);
      throw err;
    }
  };

  const addTargetChain = async () => {
    await web3auth?.addChain(chainConfig);
  };

  const switchToTargetChain = async () => {
    await web3auth?.switchChain({ chainId: targetChainId });
  };

  const init = useCallback(async () => {
    try {
      const web3auth = new Web3AuthNoModal({
        clientId: web3AuthClientId,
        chainConfig: chainConfig,
        web3AuthNetwork: "testnet",
      });

      const privateKeyProvider = new EthereumPrivateKeyProvider({
        config: { chainConfig },
      });

      const openloginAdapter = new OpenloginAdapter({
        privateKeyProvider,
        adapterSettings: {
          uxMode: "popup",
          storageKey: "local",
          sessionTime: 604800,
          loginConfig: {
            jwt: {
              name: openLoginJwtName,
              verifier: web3authVerifier,
              typeOfLogin: "jwt",
              clientId: web3AuthClientId,
            },
          },
        },
      });
      web3auth.configureAdapter(openloginAdapter);

      await web3auth.init();
      setWeb3auth(web3auth);

      const loginRes = await signInWithGoogle();
      const idToken = await loginRes.user.getIdToken(true);

      // Check if there is an existing wallet connection - eg. when user refreshes the page on accident and has to relogin
      if (web3auth.connected) {
        await web3auth.logout();
      }
      const web3authProvider = await web3auth.connectTo(
        WALLET_ADAPTERS.OPENLOGIN,
        {
          loginProvider: "jwt",
          extraLoginOptions: {
            id_token: idToken,
            verifierIdField: "sub",
            domain: developmentDomain || stagingDomain,
          },
        }
      );

      if (auctionFactoryJson) {
        const web3 = new Web3(web3authProvider);
        const networkID = await web3.eth.net.getId();
        const accounts = await web3.eth.getAccounts();
        let auctionFactoryAddress, auctionFactoryContract;
        try {
          auctionFactoryAddress =
            auctionFactoryJson.networks[networkID].address;
          auctionFactoryContract = new web3.eth.Contract(
            auctionFactoryJson.abi,
            auctionFactoryAddress
          );
        } catch (err) {
          console.error(err);
          return;
        }
        dispatch({
          type: actions.init,
          data: {
            auctionFactoryJson,
            web3auth,
            web3,
            networkID,
            accounts,
            auctionFactoryContract,
          },
        });
      }
    } catch (error) {
      console.log(error);
    }
  }, []);

  const deinitialize = async () => {
    await web3auth.logout();
    setWeb3auth(null);
  };

  return (
    <EthContext.Provider
      value={{
        state,
        dispatch,
        init,
        deinitialize,
        addTargetChain,
        switchToTargetChain,
      }}
    >
      {children}
    </EthContext.Provider>
  );
}

export default EthProvider;
