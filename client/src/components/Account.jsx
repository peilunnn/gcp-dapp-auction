import { Card, Box, Grid, Typography, Divider, Stack } from '@mui/material';
import { useEffect } from 'react';
import { useState } from 'react';
import { useEth } from '../contexts/EthContext';
import {
  displayInGwei,
  displayInHours,
  displayTimestampInHumanReadable,
} from '../utils';
import NftApprovalCard from './NftApprovalCard';
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
      for (let i = 0; i < auctions.length; i++) {
        if (auctions[i].seller === accounts[0]) {
          setAuction(auctions[i]);
        }
      }
    }
  }, [auctions, accounts]);

  return (
    <Card>
      <Grid spacing={0} container>
        <Grid item xs={12} md={6}>
          <Box p={4}>
            <CustomTypography
              sx={{
                pb: 3,
              }}
              variant="h4"
            >
              Your Latest Auction
            </CustomTypography>
            {auction ? (
              <Box>
                <CustomTypography variant="h1" gutterBottom>
                  {displayInGwei(auction.highestBid)} gwei 💰
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
                  sx={{ marginTop: "10px", marginBottom: "10px" }}
                >
                  <a href={`#${auction.auctionContract._address}`}>
                    Go to Auction
                  </a>
                </CustomTypography>
                <Box
                  display="flex"
                  sx={{
                    flexDirection: "column",
                  }}
                >
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                    spacing={2}
                  >
                    <CustomTypography variant="h4">Title</CustomTypography>
                    {auction.pinataMetadata.name}
                  </Stack>
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                    spacing={2}
                  >
                    <CustomTypography variant="h4">
                      Auction Address
                    </CustomTypography>
                    {auction.auctionContract._address}
                  </Stack>
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                    spacing={2}
                  >
                    <CustomTypography variant="h4">
                      NFT Address
                    </CustomTypography>
                    {auction.nft}
                  </Stack>
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                    spacing={2}
                  >
                    <CustomTypography variant="h4">Token ID</CustomTypography>
                    {auction.nftId}
                  </Stack>
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                    spacing={2}
                  >
                    <CustomTypography variant="h4">
                      Token Standard
                    </CustomTypography>
                    ERC-721
                  </Stack>
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                    spacing={2}
                  >
                    <CustomTypography variant="h4">Minimal increment</CustomTypography>
                    {displayInGwei(auction.increment)} gwei
                  </Stack>
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                    spacing={2}
                  >
                    <CustomTypography variant="h4">Start At</CustomTypography>
                    {displayTimestampInHumanReadable(auction.startAt)}
                  </Stack>

                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                    spacing={2}
                  >
                    <CustomTypography variant="h4">Duration</CustomTypography>
                    {displayInHours(auction.duration)} hours
                  </Stack>
                </Box>
              </Box>
            ) : (
              <CustomTypography variant="h3">
                You have not created any auctions yet...
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
          <Box
            component="span"
            sx={{
              display: { xs: "none", md: "inline-block" },
            }}
          >
            <Divider absolute orientation="vertical" />
          </Box>
          <NftApprovalCard />
        </Grid>
      </Grid>
    </Card>
  );
}

export default Account;
