import React, { useCallback, useReducer } from "react";
import Web3 from "web3";
import EthContext from "./EthContext";
import { actions, initialState, reducer } from "./state";
import { WALLET_ADAPTERS, CHAIN_NAMESPACES } from "@web3auth/base";
import { Web3AuthNoModal } from "@web3auth/no-modal";
import { OpenloginAdapter } from "@web3auth/openlogin-adapter";
import { EthereumPrivateKeyProvider } from "@web3auth/ethereum-provider";
import { GoogleAuthProvider, getAuth, signInWithPopup } from "firebase/auth";
import { initializeApp } from "firebase/app";

const targetChainId = process.env.REACT_APP_CHAIN_ID;
const targetRpcUrl = process.env.REACT_APP_RPC_URL;
const bneApiKey = process.env.REACT_APP_BNE_API_KEY;
const web3AuthClientId = process.env.REACT_APP_WEB3AUTH_CLIENT_ID;
const openLoginJwtName = "gcp-dapp-auction-jwt";
const web3authVerifier = "gcp-dapp-auction-web3auth-verifier";
const developmentDomain = "http://localhost:3000/auction";
const stagingDomain = "https://nftauctionhouse.net/auction";

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

function EthProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

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

  const init = useCallback(async (artifact) => {
    try {
      const chainConfig = {
        chainNamespace: CHAIN_NAMESPACES.EIP155,
        chainId: targetChainId,
        rpcTarget: `${targetRpcUrl}?key=${bneApiKey}`,
      };
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

      const loginRes = await signInWithGoogle();
      const idToken = await loginRes.user.getIdToken(true);

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

      if (artifact) {
        const web3 = new Web3(web3authProvider);
        const networkID = await web3.eth.net.getId();
        const accounts = await web3.eth.getAccounts();
        const { abi } = artifact;
        let address, contract;
        try {
          address = artifact.networks[networkID].address;
          contract = new web3.eth.Contract(abi, address);
        } catch (err) {
          console.error(err);
          return;
        }
        dispatch({
          type: actions.init,
          data: { artifact, web3auth, web3, networkID, accounts, contract },
        });
      }
    } catch (error) {
      console.log(error);
    }
  }, []);

  return (
    <EthContext.Provider
      value={{
        state,
        dispatch,
        init,
      }}
    >
      {children}
    </EthContext.Provider>
  );
}

export default EthProvider;
