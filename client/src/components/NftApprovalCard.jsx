import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  CircularProgress,
} from "@mui/material";
import React, { useState } from "react";
import { useEth } from "../contexts/EthContext";
import { useSnackbar } from "notistack";
import { styled } from "@mui/system";

const CustomTypography = styled(Typography)`
  font-family: "Google Sans", sans-serif;
  font-weight: 600;
`;

const NftApprovalCard = ({ auctionContractAddress, tokenId }) => {
  const { enqueueSnackbar } = useSnackbar();
  const {
    state: { web3, networkID, accounts },
  } = useEth();
  const nftJson = require("../contracts/MintNFT.json");
  const [vars, setVars] = useState({
    auctionContractAddress: auctionContractAddress || "",
    tokenId: tokenId || "",
  });
  const [approveLoading, setApproveLoading] = useState(false);

  const handleAddressInput = (event) => {
    setVars({
      ...vars,
      auctionContractAddress: event.target.value,
    });
  };

  const handleNftIdInput = (event) => {
    setVars({
      ...vars,
      tokenId: event.target.value,
    });
  };

  const handleApproval = async () => {
    setApproveLoading(true);
    let auctionContractAddress = nftJson.networks[networkID].address;
    let mintNFTContract = new web3.eth.Contract(
      nftJson.abi,
      auctionContractAddress
    );
    const tokenId = parseInt(vars.tokenId);
    try {
      await mintNFTContract.methods
        .approve(vars.auctionContractAddress, tokenId)
        .send({ from: accounts[0] });
      enqueueSnackbar("Approval successful", {
        variant: "success",
      });

      setApproveLoading(false);
      setVars({
        auctionContractAddress: "",
        tokenId: "",
      });
    } catch (err) {
      console.log(err);
      enqueueSnackbar("Approval failed", {
        variant: "error",
      });
    }
  };

  return (
    <Card>
      <CardContent>
        <CustomTypography variant="h3" component="div">
          Approve Auction Contract to Own NFT
        </CustomTypography>
        <form className="nft-approval-form">
          <TextField
            placeholder="Auction Address"
            name="auctionContractAddress"
            value={auctionContractAddress}
            onChange={handleAddressInput}
            margin="normal"
            required
            label="Auction Address"
            id="auctionContractAddress"
          />
          <TextField
            margin="normal"
            required
            label="NFT Token ID"
            id="nftTokenId"
            placeholder="NFT token ID"
            name="tokenId"
            value={vars.tokenId}
            onChange={handleNftIdInput}
            type="number"
          />
        </form>

        {!approveLoading && (
          <Button
            onClick={handleApproval}
            variant="outlined"
            sx={{
              padding: "10px 30px",
              marginTop: "8px",
              color: "#fff",
              backgroundColor: "#FF9900",
              "&:hover": {
                backgroundColor: "#cc7a00",
              },
            }}
          >
            Approve
          </Button>
        )}
        {approveLoading && (
          <Box
            position="relative"
            display="flex"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            sx={{ marginTop: "20px" }}
          >
            <CircularProgress
              size={24}
              sx={{
                color: "#FF9900",
              }}
            />
            <Typography
              variant="subtitle1"
              sx={{
                color: "#FF9900",
                marginTop: "10px",
              }}
            >
              Waiting for wallet confirmation...
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default NftApprovalCard;
