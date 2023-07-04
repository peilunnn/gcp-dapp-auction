import { Card, Box, Grid, Typography, List, Button } from "@mui/material";
import AuctionDetails from "./AuctionDetails";
import { styled } from "@mui/system";

const CustomTypography = styled(Typography)`
  font-family: "Google Sans", sans-serif;
  font-weight: 600;
`;

function Listing({ auctions, refetchData }) {
  if (auctions === undefined) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100%",
        }}
      >
        <CustomTypography variant="h3">Loading...</CustomTypography>
      </Box>
    );
  }
  return (
    <Card>
      <CustomTypography
        display="flex"
        justifyContent="center"
        alignItems="center"
        mt={4}
        variant="h4"
      >
        All Auctions{" "}
        <Button
          onClick={() => {
            refetchData();
          }}
          variant="text"
          color="secondary"
          size="small"
        >
          Refresh
        </Button>
      </CustomTypography>
      <Grid spacing={0} container>
        <Box py={4} pr={4} flex={1}>
          <Grid
            container
            xs={12}
            item
            display="flex"
            alignItems="center"
            justifyContent="center"
          >
            <List
              sx={{
                width: "80%",
              }}
            >
              {auctions === [] ? (
                <CustomTypography
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                >
                  No Auctions available at the moment...
                </CustomTypography>
              ) : (
                auctions.map((auction, idx) => (
                  <AuctionDetails
                    auction={auction}
                    refetchData={refetchData}
                    key={idx}
                  />
                ))
              )}
            </List>
          </Grid>
        </Box>
      </Grid>
    </Card>
  );
}

export default Listing;
