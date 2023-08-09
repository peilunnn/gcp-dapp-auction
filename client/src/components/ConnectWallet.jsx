import Button from "@mui/material/Button";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";
import { Box, Typography } from "@mui/material";
import { useState, useEffect } from "react";
import { Web3Auth } from "@web3auth/modal";
import { OpenloginAdapter } from "@web3auth/openlogin-adapter";
import Web3 from "web3";

const targetChainName = process.env.REACT_APP_CHAIN_NAME;
const targetChainId = process.env.REACT_APP_CHAIN_ID;
console.log(process.env);
console.log(targetChainId);
const targetRpcUrl = process.env.REACT_APP_RPC_URL;

const web3AuthClientId =
  "BDfstoibJFZ7HFdh9oEThzC94Ctr4NgMeXXFQ2qjoLIqMe8aOuPlIfEKofQMxoi2dZDkxNmyRyLA4jTGsk4QJHM";

const web3AuthProvider = new Web3Auth({
  clientId: web3AuthClientId,
  web3AuthNetwork: "testnet",
  chainConfig: {
    chainNamespace: "eip155",
    chainId: targetChainId,
    rpcTarget: targetRpcUrl,
  },
});

const openloginAdapter = new OpenloginAdapter({
  adapterSettings: {
    uxMode: "popup",
    loginConfig: {
      google: {
        verifier: "gcp-dapp-auction-testnet-verifier",
        typeOfLogin: "google",
        clientId:
          "58289349527-kf07v1n64cjt3qch05ervd89pbcd3325.apps.googleusercontent.com",
      },
    },
  },
});
web3AuthProvider.configureAdapter(openloginAdapter);

const ConnectWallet = ({ setWeb3, setAccounts, setNetworkID }) => {
  const [errorMessage, setErrorMessage] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [currentChainId, setCurrentChainID] = useState(null);
  const [loading, setLoading] = useState(false);
  const [currentAccount, setCurrentAccount] = useState(null);
  const [provider, setProvider] = useState(null);

  useEffect(() => {
    if (window.ethereum) {
      const updateChainId = async () => {
        const newChainId = await window.ethereum.request({
          method: "eth_chainId",
        });
        setCurrentChainID(newChainId);
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
    const targetChain = {
      chainId: targetChainId,
      displayName: targetChainName,
      chainNamespace: "eip155",
      tickerName: targetChainName,
      ticker: "ETH",
      decimals: 18,
      rpcTarget: targetRpcUrl,
      blockExplorer: "https://etherscan.io",
    };
    await web3AuthProvider?.addChain(targetChain);
  };

  const switchToTargetChain = async () => {
    await web3AuthProvider?.switchChain({ chainId: targetChainId });
  };

  const disconnect = () => {
    setLoading(true);
    setIsConnected(false);
    setLoading(false);
  };

  const connectWallet = async () => {
    setLoading(true);
    try {
      await web3AuthProvider.initModal();
      const provider = await web3AuthProvider.connect();
      setProvider(provider);
      const web3 = new Web3(provider);
      setWeb3(web3);
      const accounts = await web3.eth.getAccounts();
      setCurrentAccount(accounts[0]);
      const currentChainID = await web3.eth.getChainId();
      setCurrentChainID(currentChainID);
      const networkID = await web3.eth.net.getId();
      setNetworkID(networkID);

      await addTargetChain();
      await switchToTargetChain();
      setIsConnected(true);
      setLoading(false);
    } catch (error) {
      console.log(error.message);
      setErrorMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {errorMessage && <Alert severity="error">{errorMessage}</Alert>}
      {!errorMessage && isConnected && !loading && (
        <Button variant="outlined" color="success" onClick={disconnect}>
          ✅ Account {currentAccount ? currentAccount.slice(0, 5) : ""}... on
          chain {currentChainId}{" "}
        </Button>
      )}
      {!errorMessage && !isConnected && !loading && (
        <Button
          variant="outlined"
          onClick={connectWallet}
          sx={{
            backgroundColor: "#FF9900",
            color: "#FFF",
            "&:hover": {
              backgroundColor: "#FF9900",
            },
          }}
        >
          Connect Wallet
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
              Waiting for login...
            </Typography>
          </Box>
        </Button>
      )}
    </div>
  );
};

export default ConnectWallet;
