import {
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
} from "@mui/material";
import React, { useState } from "react";
import { useEth } from "../contexts/EthContext";
import { useSnackbar } from "notistack";
import { styled } from "@mui/system";

const CustomTypography = styled(Typography)`
  font-family: "Google Sans", sans-serif;
  font-weight: 600;
`;

const NftApprovalCard = () => {
  const { enqueueSnackbar } = useSnackbar();
  const {
    state: { web3, networkID, accounts },
  } = useEth();
  const nftJson = require("../contracts/MintNFT.json");
  const [vars, setVars] = useState({
    auctionContractAddress: "",
    tokenId: "",
  });

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
    let auctionContractAddress = nftJson.networks[networkID].address;
    let mintNFTContract = new web3.eth.Contract(nftJson.abi, auctionContractAddress);
    const tokenId = parseInt(vars.tokenId);
    try {
      await mintNFTContract.methods
        .approve(vars.auctionContractAddress, tokenId)
        .send({ from: accounts[0] });
      enqueueSnackbar("Approval successful", {
        variant: "success",
      });
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
            value={vars.auctionContractAddress}
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
      </CardContent>
    </Card>
  );
};

export default NftApprovalCard;
