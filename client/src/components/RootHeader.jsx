import { Box, Card, Container, styled } from "@mui/material";
import Login from "./Login";
const HeaderWrapper = styled(Card)(
  ({ theme }) => `
    width: 100%;
    display: flex;
    align-items: center;
    height: ${theme.spacing(10)};
    margin-bottom: ${theme.spacing(10)};
  `
);

function RootHeader({ web3auth, web3, networkID, accounts}) {
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
              <Login
                web3auth={web3auth}
                web3={web3}
                networkID={networkID}
                accounts={accounts}
              />
            </Box>
          </Box>
        </Box>
      </Container>
    </HeaderWrapper>
  );
}

export default RootHeader;
