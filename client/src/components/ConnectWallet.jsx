import Button from "@mui/material/Button";
import { useWeb3React } from "@web3-react/core";
import { InjectedConnector } from "@web3-react/injected-connector";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";
import { Box, Typography } from "@mui/material";
import { useState, useEffect } from "react";

const targetChainName = process.env.REACT_APP_CHAIN_NAME;
const targetChainId = process.env.REACT_APP_CHAIN_ID;
const targetRpcUrl = process.env.REACT_APP_RPC_URL;

const Injected = new InjectedConnector({
  supportedChainIds: [
    1, // Ethereum Mainnet
    parseInt(targetChainId, 16),
  ],
});

const ConnectWallet = () => {
  const { activate, deactivate } = useWeb3React();
  const [errorMessage, setErrorMessage] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [currentChainId, setCurrentChainId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [currentAccount, setCurrentAccount] = useState(null);

  useEffect(() => {
    if (window.ethereum) {
      const updateChainId = async () => {
        const newChainId = await window.ethereum.request({
          method: "eth_chainId",
        });
        setCurrentChainId(newChainId);
      };

      window.ethereum.on("chainChanged", updateChainId);

      return () => {
        window.ethereum.removeListener("chainChanged", updateChainId);
      };
    }
  }, []);

  useEffect(() => {
    if (window.ethereum) {
      const updateAccount = async () => {
        const accounts = await window.ethereum.request({
          method: "eth_requestAccounts",
        });
        setCurrentAccount(accounts[0]);
      };

      window.ethereum.on("accountsChanged", updateAccount);

      return () => {
        window.ethereum.removeListener("accountsChanged", updateAccount);
      };
    }
  }, []);

  const addTargetChain = async () => {
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
  };

  const switchToTargetChain = async () => {
    await window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: targetChainId }],
    });
  };

  const promptConnectAccount = async () => {
    await window.ethereum.request({
      method: "wallet_requestPermissions",
      params: [
        {
          eth_accounts: {},
        },
      ],
    });
  };

  const disconnect = () => {
    setLoading(true);
    deactivate(Injected);
    setIsConnected(false);
    setLoading(false);
  };

  const connectToTargetChain = async () => {
    if (window.ethereum) {
      setErrorMessage(null); // clear previous errors

      const chainId = await window.ethereum.request({
        method: "eth_chainId",
      });
      setCurrentChainId(chainId);

      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      setCurrentAccount(accounts[0]);

      // If user is already on the target network but not connected, prompt user to connect their account to the site
      if (currentChainId === targetChainId && !isConnected) {
        setLoading(true);
        await promptConnectAccount();
        await activate(Injected);
        setIsConnected(true);
        setLoading(false);
        return;
      }

      // Otherwise, if user is on a different network, attempt to switch to the target network
      try {
        setLoading(true);
        setIsConnected(true);
        await switchToTargetChain();
        setLoading(false);
      } catch (switchError) {
        if (switchError.code === 4902) {
          try {
            await addTargetChain();
            await switchToTargetChain();
            setLoading(false);
          } catch (addError) {
            console.log(addError);
            setLoading(false);
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
      {errorMessage && <Alert severity="error">{errorMessage}</Alert>}
      {!errorMessage && isConnected && !loading && (
        <Button variant="outlined" color="success" onClick={disconnect}>
          ✅ Account {currentAccount ? currentAccount.slice(0, 5) : ""}... on chain{" "}
          {currentChainId}
        </Button>
      )}
      {!errorMessage && !isConnected && !loading && (
        <Button
          variant="outlined"
          onClick={connectToTargetChain}
          sx={{
            backgroundColor: "#FF9900",
            color: "#FFF",
            "&:hover": {
              backgroundColor: "#FF9900",
            },
          }}
        >
          Connect to Metamask
        </Button>
      )}
      {!errorMessage && loading && (
        <Button
          sx={{
            backgroundColor: "#FF9900",
            color: "#FFF",
            "&:hover": {
              backgroundColor: "#FF9900",
            },
          }}
        >
          <Box
            position="relative"
            display="flex"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
          >
            <CircularProgress
              size={18}
              sx={{
                color: "#FFF",
              }}
            />
            <Typography
              variant="body2"
              sx={{
                color: "#FFF",
                marginTop: "10px",
              }}
            >
              Waiting for wallet confirmation...
            </Typography>
          </Box>
        </Button>
      )}
    </div>
  );
};

export default ConnectWallet;
