import { Card, Box, Grid, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { useEth } from "../contexts/EthContext";
import NftApprovalCard from "./NftApprovalCard";
import { styled } from "@mui/system";

const CustomTypography = styled(Typography)`
  font-family: "Google Sans", sans-serif;
  font-weight: 600;
`;

function Account({ auctions }) {
  const [auction, setAuction] = useState();
  const {
    state: { accounts },
  } = useEth();

  useEffect(() => {
    if (auctions !== undefined && auctions.length > 0) {
      for (let i = auctions.length - 1; i >= 0; i--) {
        if (auctions[i].seller === accounts[0]) {
          setAuction(auctions[i]);
          break; // Stop searching after finding the latest auction
        }
      }
    }
  }, [auctions, accounts]);

  return (
    <Card>
      <Grid spacing={0} container>
        <Grid item xs={12} md={6}>
          <Box p={4}>
            <CustomTypography sx={{ pb: 3 }} variant="h3">
              Your Latest Auction
            </CustomTypography>
            {auction ? (
              <Box>
                <CustomTypography variant="h1" gutterBottom>
                  {auction.highestBid} gwei 💰
                </CustomTypography>
                <CustomTypography
                  variant="h4"
                  fontWeight="normal"
                  color="text.secondary"
                >
                  Current Highest Bid Amount{" "}
                  {auction.highestBidder ===
                  "0x0000000000000000000000000000000000000000"
                    ? "(Your starting bid amount)"
                    : "(From " + auction.highestBidder.slice(0, 8) + "...)"}
                </CustomTypography>
                <CustomTypography
                  variant="h3"
                  color="orange"
                  sx={{ marginTop: "10px", marginBottom: "10px" }}
                >
                  <a href={`#${auction.auctionContract._address}`}>
                    Go to Auction
                  </a>
                </CustomTypography>
              </Box>
            ) : (
              <CustomTypography variant="h4">
                You have not created any auctions yet.
              </CustomTypography>
            )}
          </Box>
        </Grid>
        <Grid
          sx={{
            position: "relative",
          }}
          display="flex"
          alignItems="center"
          item
          xs={12}
          md={6}
        >
          {auction && (
            <NftApprovalCard
              auctionContractAddress={auction.auctionContract._address}
              tokenId={auction.nftId}
            />
          )}
        </Grid>
      </Grid>
    </Card>
  );
}

export default Account;
