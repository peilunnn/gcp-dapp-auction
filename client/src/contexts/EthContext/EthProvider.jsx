import React, { useCallback, useEffect, useReducer } from "react";
import Web3 from "web3";
import EthContext from "./EthContext";
import { actions, initialState, reducer } from "./state";

function EthProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  const init = useCallback(async (artifact) => {
    if (!Web3.givenProvider) {
      console.error(
        "MetaMask or another Ethereum provider not detected. Please install it to continue."
      );
      return;
    }

    if (artifact) {
      const web3 = new Web3(Web3.givenProvider || "ws://localhost:8545");
      const accounts = await web3.eth.requestAccounts();
      const networkID = await web3.eth.net.getId();
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
        data: { artifact, web3, accounts, networkID, contract },
      });
    }
  }, []);

  useEffect(() => {
    const tryInit = async () => {
      try {
        const artifact = require("../../contracts/AuctionFactory.json");
        init(artifact);
      } catch (err) {
        console.error(err);
        return;
      }
    };

    tryInit();
  }, [init]);

  useEffect(() => {
    if (!window.ethereum) {
      console.log(
        "Ethereum provider not available. Please install MetaMask or another Ethereum provider to continue."
      );
      return;
    }
    const events = ["chainChanged", "accountsChanged"];
    const handleChange = () => {
      init(state.artifact);
    };

    events.forEach((e) => window.ethereum.on(e, handleChange));
    return () => {
      events.forEach((e) => window.ethereum.removeListener(e, handleChange));
    };
  }, [init, state.artifact]);

  return (
    <EthContext.Provider
      value={{
        state,
        dispatch,
      }}
    >
      {children}
    </EthContext.Provider>
  );
}

export default EthProvider;
