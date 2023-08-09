import { Box, Card, Container, styled } from "@mui/material";
import ConnectWallet from "./ConnectWallet";
const HeaderWrapper = styled(Card)(
  ({ theme }) => `
    width: 100%;
    display: flex;
    align-items: center;
    height: ${theme.spacing(10)};
    margin-bottom: ${theme.spacing(10)};
  `
);

function RootHeader({
  setWeb3,
  setAccounts,
  setNetworkID,
}) {
  return (
    <HeaderWrapper>
      <Container maxWidth="lg">
        <Box display="flex" alignItems="center">
          <Box
            display="flex"
            alignItems="center"
            justifyContent="space-between"
            flex={1}
          >
            <Box display="flex" alignItems="center" gap={2}>
              <img src="/favicon.ico" alt="logo"></img>
              <h2 style={{ cursor: "default" }}>NFTAuctionHouse</h2>
            </Box>
            <Box>
              <ConnectWallet
                setWeb3={setWeb3}
                setAccounts={setAccounts}
                setNetworkID={setNetworkID}
              />
            </Box>
          </Box>
        </Box>
      </Container>
    </HeaderWrapper>
  );
}

export default RootHeader;
