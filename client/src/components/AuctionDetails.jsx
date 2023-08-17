import {
  ListItem,
  styled,
  ListItemAvatar,
  alpha,
  Box,
  Typography,
  Stack,
  Divider,
  Tooltip,
} from "@mui/material";
import { useEth } from "../contexts/EthContext";
import {
  displayInGwei,
  displayInHours,
  displayTimestampInHumanReadable,
} from "../utils";
import NFTListingBidModal from "./NFTListingBidModal";

const CustomTypography = styled(Typography)`
  font-family: "Google Sans", sans-serif;
  font-weight: 600;
`;

const ListItemAvatarWrapper = styled(ListItemAvatar)(
  ({ theme }) => `
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin-right: ${theme.spacing(1)};
  padding: ${theme.spacing(0.5)};
  border-radius: 5px;
  background: ${
    theme.palette.mode === "dark"
      ? theme.colors.alpha.trueWhite[30]
      : alpha(theme.colors.alpha.black[100], 0.07)
  };
  img {
    background: ${theme.colors.alpha.trueWhite[100]};
    padding: ${theme.spacing(0.5)};
    display: block;
    border-radius: inherit;
    object-fit: contain;
  }
  
`
);

const ListItemWrapper = styled(ListItem)(
  ({ theme }) => `
  transition: ${theme.transitions.create(["background-color", "transform"], {
    duration: theme.transitions.duration.standard,
  })};
  &:hover {
    background-color: rgba(34, 51, 84, 0.07);
    transform: scale(1.01);
  }
`
);

function AuctionDetails({ auction, refetchData, key, openConfirmationModal }) {
  const { pinataMetadata } = auction;
  const {
    state: { accounts },
  } = useEth();
  return (
    <ListItemWrapper id={auction.auctionContract._address}>
      <ListItemAvatarWrapper>
        {accounts[0] === auction.seller && (
          <CustomTypography sx={{ fontWeight: "bold" }}>
            ✨My Auction✨
          </CustomTypography>
        )}
        <img alt="img" src={pinataMetadata.image} width={450} height={450} />
      </ListItemAvatarWrapper>
      <Box display="flex" flexDirection="column" sx={{ width: "100%" }}>
        <CustomTypography
          sx={{ fontWeight: "bold" }}
        >{`Title: ${pinataMetadata.name}`}</CustomTypography>
        <CustomTypography
          sx={{ fontWeight: "bold" }}
        >{`Description: ${pinataMetadata.description}`}</CustomTypography>
        <Tooltip
          title={
            auction.started &&
            auction.ended &&
            auction.highestBidder !==
              "0x0000000000000000000000000000000000000000"
              ? auction.highestBidder
              : auction.seller
          }
          arrow
        >
          <CustomTypography sx={{ fontWeight: "bold" }}>
            {`Owned By: ${
              auction.started &&
              auction.ended &&
              auction.highestBidder !==
                "0x0000000000000000000000000000000000000000"
                ? auction.highestBidder.slice(0, 8) + "..."
                : auction.seller.slice(0, 8) + "..."
            }`}
          </CustomTypography>
        </Tooltip>
        <Divider
          variant="middle"
          sx={{ marginTop: "10px", marginBottom: "10px" }}
        />
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
            <CustomTypography>Highest Bid</CustomTypography>
            {displayInGwei(auction.highestBid)} gwei
          </Stack>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            spacing={2}
          >
            <CustomTypography>Minimum Increment</CustomTypography>
            {displayInGwei(auction.increment)} gwei
          </Stack>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            spacing={2}
          >
            <CustomTypography>Start At</CustomTypography>
            {displayTimestampInHumanReadable(auction.startAt)}
          </Stack>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            spacing={2}
          >
            <CustomTypography>Duration</CustomTypography>
            {displayInHours(auction.duration)} hours
          </Stack>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            spacing={2}
          >
            <CustomTypography>Auction Started</CustomTypography>
            {auction.started ? "Yes" : "No"}
          </Stack>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            spacing={2}
          >
            <CustomTypography>Auction Ended</CustomTypography>
            {auction.ended ? "Yes" : "No"}
          </Stack>
          <NFTListingBidModal
            pinataMetadata={pinataMetadata}
            auctionData={auction}
            refetchData={refetchData}
            openConfirmationModal={openConfirmationModal}
          />
        </Box>
      </Box>
    </ListItemWrapper>
  );
}

export default AuctionDetails;
