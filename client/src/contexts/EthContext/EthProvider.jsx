import React, { useCallback, useEffect, useReducer } from "react";
import EthContext from "./EthContext";
import { actions, initialState, reducer } from "./state";

function EthProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  const init = useCallback(async (artifact) => {
    if (artifact) {
      // const networkID = await web3.eth.net.getId();
      // const { abi } = artifact;
      // let address, contract;
      // try {
      //   address = artifact.networks[networkID].address;
      //   contract = new web3.eth.Contract(abi, address);
      // } catch (err) {
      //   console.error(err);
      //   return;
      // }
      dispatch({
        type: actions.init,
        // data: { artifact, web3, accounts, networkID, contract },
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
