import Button from "@mui/material/Button";
import { useWeb3React } from "@web3-react/core";
import { InjectedConnector } from "@web3-react/injected-connector";
import { useState } from "react";
import Alert from "@mui/material/Alert";

const targetChainName = process.env.REACT_APP_CHAIN_NAME;
const targetChainId = process.env.REACT_APP_CHAIN_ID;
const targetRpcUrl = process.env.REACT_APP_RPC_URL;

const Injected = new InjectedConnector({
  supportedChainIds: [
    1, // Ethereum Mainnet
    parseInt(process.env.REACT_APP_LOCAL_GANACHE_CHAIN_ID, 16),
    parseInt(process.env.REACT_APP_SEPOLIA_TESTNET_CHAIN_ID, 16),
  ],
});

const ConnectWallet = () => {
  const { account, activate, deactivate, active } = useWeb3React();
  const [errorMessage, setErrorMessage] = useState(null);

  const switchToCustomChain = async () => {
    if (window.ethereum) {
      setErrorMessage(null); // clear previous errors

      const currentChainId = await window.ethereum.request({
        method: "eth_chainId",
      });

      // If user is already on the target network, just toggle the UI
      if (currentChainId === targetChainId) {
        if (active) {
          deactivate();
        } else {
          activate(Injected);
        }
        return;
      }

      // If user is on a different network eg. Polygon Mainnet, attempt to switch to the target network
      try {
        await window.ethereum.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: targetChainId }],
        });

        // Listen for the 'chainChanged' event. Only when the networks have finished switching, then we set active to true
        window.ethereum.once("chainChanged", function (chainId) {
          if (chainId === targetChainId) {
            activate(Injected);
          }
        });
      } catch (switchError) {
        if (switchError.code === 4902) {
          try {
            await window.ethereum.request({
              method: "wallet_addEthereumChain",
              params: [
                {
                  chainId: targetChainId,
                  chainName: targetChainName,
                  rpcUrls: [targetRpcUrl],
                  nativeCurrency: {
                    name: "ETH",
                    symbol: "ETH",
                    decimals: 18,
                  },
                },
              ],
            });

            await window.ethereum.request({
              method: "wallet_switchEthereumChain",
              params: [{ chainId: targetChainId }],
            });

            // Listen for the 'chainChanged' event. Only when the networks have finished switching, then we set active to true
            window.ethereum.once("chainChanged", function (chainId) {
              if (chainId === targetChainId) {
                activate(Injected);
              }
            });
          } catch (addError) {
            console.log(addError);
          }
        }
      }
    } else {
      setErrorMessage(
        "Please make sure you have MetaMask installed, then refresh the page."
      );
    }
  };

  return (
    <div>
      {active ? (
        <Button variant="outlined" color="success" onClick={deactivate}>
          ✅ Account {account.slice(0, 5)}... on chain{" "}
          {targetChainId.toString(16)}
        </Button>
      ) : errorMessage ? (
        <Alert severity="error">{errorMessage}</Alert>
      ) : (
        <Button
          variant="contained"
          size="large"
          onClick={switchToCustomChain}
          sx={{
            backgroundColor: "#FF9900",
            "&:hover": {
              backgroundColor: "#cc7a00",
            },
          }}
        >
          Connect to Metamask
        </Button>
      )}
    </div>
  );
};

export default ConnectWallet;
