import Button from "@mui/material/Button";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";
import { Box, Card, Typography, styled } from "@mui/material";
import { useState, useEffect } from "react";
import { useEth } from "../contexts/EthContext";
import Modal from "@mui/material/Modal";

const Login = ({ web3auth, web3, networkID, accounts }) => {
  const { init, deinitialize, addTargetChain, switchToTargetChain } = useEth();
  const [isInitialized, setIsInitialized] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(false);
  const [profileImageUrl, setProfileImageUrl] = useState(null);
  const [profileName, setProfileName] = useState(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [ethBalance, setEthBalance] = useState(0);
  const [usdBalance, setUsdBalance] = useState(0);

  const CustomTypography = styled(Typography)`
    font-family: "Google Sans", sans-serif;
  `;

  useEffect(() => {
    console.log(`in login: ${web3auth} ${web3}, ${networkID}, ${accounts}`);
  }, [web3auth, web3, networkID, accounts]);

  useEffect(() => {
    if (isInitialized && web3auth) {
      const postInitOperations = async () => {
        await addTargetChain();
        await switchToTargetChain();
        setIsLoggedIn(true);

        // Set up profile image
        const userInfo = await web3auth.getUserInfo();
        setProfileImageUrl(userInfo.profileImage);
        setProfileName(userInfo.name);

        // Set up wallet balances
        const ethBalanceInWei = await web3.eth.getBalance(accounts[0]);
        const ethBalanceInEther = parseFloat(
          web3.utils.fromWei(ethBalanceInWei, "ether")
        );
        setEthBalance(ethBalanceInEther);
        const response = await fetch(
          "https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd"
        );
        const data = await response.json();
        const ethToUsdRate = data.ethereum.usd;
        const usdBalance = ethBalanceInEther * ethToUsdRate;
        setUsdBalance(usdBalance);

        setLoading(false);
      };
      postInitOperations();
    }
  }, [isInitialized]);

  const handleProfileClick = () => {
    setIsProfileModalOpen(true);
  };

  const logout = async () => {
    deinitialize();
    setIsLoggedIn(false);
    setIsInitialized(false);
    setErrorMessage(null);
    setProfileImageUrl(null);
    setProfileName(null);
    setEthBalance(0);
    setUsdBalance(0);
  };

  const login = async () => {
    try {
      if (web3auth?.isConnected) {
        await web3auth.disconnect();
      }
      setLoading(true);
      await init();
      setIsInitialized(true);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div>
      {errorMessage && <Alert severity="error">{errorMessage}</Alert>}
      {!errorMessage && isLoggedIn && !loading && (
        <Box display="flex" alignItems="center">
          {profileImageUrl && (
            <img
              src={profileImageUrl}
              alt="User Profile"
              width="50"
              height="50"
              style={{ borderRadius: "50%", marginRight: "20px" }}
              onClick={handleProfileClick}
            />
          )}
          <Button variant="contained" color="success" onClick={logout}>
            Logout
          </Button>
        </Box>
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
      <Modal
        open={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
      >
        <Card
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 400,
            bgcolor: "background.paper",
            border: "1px solid #ccc",
            boxShadow: 24,
            p: 4,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <CustomTypography variant="h3" component="h2" textAlign="center">
            {profileName}
          </CustomTypography>
          <img
            src={profileImageUrl}
            alt="User Profile"
            width="100"
            height="100"
            style={{ borderRadius: "50%", margin: "10px 0" }}
          />
          {accounts && (
            <CustomTypography
              variant="h6"
              component="h2"
              textAlign="center"
              sx={{ margin: "10px" }}
            >
              {accounts[0]}
            </CustomTypography>
          )}
          <Box
            sx={{
              width: "100%",
              height: "1px",
              bgcolor: "grey",
              my: 2,
            }}
          ></Box>
          <CustomTypography variant="h3" textAlign="center">
            {ethBalance.toFixed(4)} ETH
          </CustomTypography>
          <CustomTypography
            variant="h4 "
            textAlign="center"
            sx={{ color: "grey", margin: "10px" }}
          >
            {usdBalance.toFixed(2)} USD
          </CustomTypography>
          <Button onClick={() => setIsProfileModalOpen(false)}>Close</Button>
        </Card>
      </Modal>{" "}
    </div>
  );
};

export default Login;
