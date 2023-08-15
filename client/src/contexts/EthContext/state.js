const actions = {
  init: "INIT",
};

const initialState = {
  auctionFactoryJson: null,
  web3auth: null,
  web3: null,
  networkID: null,
  accounts: null,
  contract: null,
};

const reducer = (state, action) => {
  const { type, data } = action;
  switch (type) {
    case actions.init:
      return { ...state, ...data };
    default:
      throw new Error("Undefined reducer action type");
  }
};

export { actions, initialState, reducer };
