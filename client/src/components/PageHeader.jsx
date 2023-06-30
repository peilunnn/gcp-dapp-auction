import { Typography, Avatar, Grid, useTheme } from "@mui/material";
import { useEth } from "../contexts/EthContext";
import { styled } from "@mui/system";

const CustomTypography = styled(Typography)`
  font-family: "Google Sans", sans-serif;
  font-weight: 600;
`;

function PageHeader() {
  const {
    state: { accounts },
  } = useEth();
  const user = {
    avatar: `https://avatars.dicebear.com/api/pixel-art-neutral/${
      accounts === null ? "1" : accounts[0]
    }.svg`,
  };
  const theme = useTheme();

  return (
    <Grid container alignItems="center">
      <Grid item>
        <Avatar
          sx={{
            mr: 2,
            width: theme.spacing(10),
            height: theme.spacing(10),
          }}
          variant="rounded"
          alt={user.name}
          src={user.avatar}
        />
      </Grid>
      <Grid item>
        <CustomTypography variant="h3" component="h3" gutterBottom>
          Welcome
        </CustomTypography>
        <CustomTypography variant="h3">
          Participate in NFT auctions now!
        </CustomTypography>
      </Grid>
    </Grid>
  );
}

export default PageHeader;
