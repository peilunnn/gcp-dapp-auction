import Button from "@mui/material/Button";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";
import { Box, Typography } from "@mui/material";
import { useState, useEffect } from "react";
import { useEth } from "../contexts/EthContext";

const targetChainName = process.env.REACT_APP_CHAIN_NAME;
const targetChainId = process.env.REACT_APP_CHAIN_ID;
const targetRpcUrl = process.env.REACT_APP_RPC_URL;
const artifact = require("../contracts/AuctionFactory.json");

const Login = ({ web3auth, web3, networkID, accounts }) => {
  const { init } = useEth();
  const [errorMessage, setErrorMessage] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(false);
  const [profilePhoto, setProfilePhoto] = useState(null);

  useEffect(() => {
    console.log(`in login: ${web3auth} ${web3}, ${networkID}, ${accounts}`);
  }, [web3auth, web3, networkID, accounts]);

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
    await web3auth?.addChain(targetChain);
  };

  const switchToTargetChain = async () => {
    await web3auth?.switchChain({ chainId: targetChainId });
  };

  const logout = async () => {
    await web3auth.logout();
    setIsLoggedIn(false);
  };

  const login = async () => {
    setLoading(true);

    await init(artifact);
    setIsLoggedIn(true);

    await addTargetChain();
    await switchToTargetChain();

    setLoading(false);
  };

  return (
    <div>
      {errorMessage && <Alert severity="error">{errorMessage}</Alert>}
      {!errorMessage && isLoggedIn && !loading && (
        <Button variant="contained" color="success" onClick={logout}>
          Logout
        </Button>
      )}
      {!errorMessage && !isLoggedIn && !loading && (
        <Button
          variant="outlined"
          onClick={login}
          sx={{
            backgroundColor: "#FF9900",
            color: "#FFF",
            "&:hover": {
              backgroundColor: "#FF9900",
            },
          }}
        >
          Login
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

export default Login;
