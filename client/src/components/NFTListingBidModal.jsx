import { CircularProgress } from "@mui/material";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Modal from "@mui/material/Modal";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { useSnackbar } from "notistack";
import * as React from "react";
import { useEffect, useState } from "react";
import { useEth } from "../contexts/EthContext";
import { displayInGwei } from "../utils";
import CountdownTimer from "./CountdownTimer";
import { styled } from "@mui/system";
import {
  insertIntoNftBids,
  insertIntoNftSales,
} from "../scripts/sendDataToBigQuery";

const CustomTypography = styled(Typography)`
  font-family: "Google Sans", sans-serif;
  font-weight: 600;
`;

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  bgcolor: "background.paper",
  border: "2px solid #000",
  boxShadow: 24,
  p: 4,
};

function getRPCErrorMessage(err) {
  let msg = "";
  console.log(err);
  try {
    var open = err.message.indexOf("{");
    var close = err.message.lastIndexOf("}");
    var j_s = err.message.substring(open, close + 1);
    var j = JSON.parse(j_s);

    msg = j.value.data.message;
    open = msg.indexOf("revert");
    close = msg.length;
    msg = msg.substring(open + 7, close);
  } catch (err) {
    msg = "An error occurred";
  }

  return msg;
}

const calculateTimeTillExpiry = (auctionData) => {
  const expiryTime = auctionData.endAt;
  const currentTime = Math.floor(Date.now() / 1000);
  const timeTillExpiryInSeconds = expiryTime - currentTime;
  return {
    timeTillExpiryHours: Math.floor(timeTillExpiryInSeconds / 3600),
    timeTillExpiryMinutes: Math.floor((timeTillExpiryInSeconds % 3600) / 60),
    timeTillExpirySeconds: timeTillExpiryInSeconds % 60,
  };
};

function NFTListingBidModal({ pinataMetadata, auctionData, refetchData }) {
  const { enqueueSnackbar } = useSnackbar();
  const {
    state: { accounts },
  } = useEth();
  const [open, setOpen] = useState(false);
  const handleOpen = () => {
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
    refetchData();
  };
  const [highestBid, setHighestBid] = useState(auctionData.highestBid);
  const [highestBidder, setHighestBidder] = useState(auctionData.highestBidder);
  const [role, setRole] = useState("bidder");
  const { timeTillExpiryHours, timeTillExpiryMinutes, timeTillExpirySeconds } =
    calculateTimeTillExpiry(auctionData);
  const [currBidAmount, setCurrBidAmount] = useState(0);
  const [startLoading, setStartLoading] = useState(false);
  const [endLoading, setEndLoading] = useState(false);
  const [submitBidLoading, setSubmitBidLoading] = useState(false);
  const [withdrawLoading, setWithdrawLoading] = useState(false);

  useEffect(() => {
    if (accounts[0] === auctionData.seller) {
      setRole("seller");
    } else if (accounts[0] === highestBidder) {
      setRole("highestBidder");
    } else if (auctionData.userBidAmount > 0) {
      setRole("bidder");
    } else {
      setRole("notBidder");
    }
  }, [
    accounts,
    highestBidder,
    auctionData.seller,
    auctionData.userBidAmount,
    open,
  ]);

  // As soon as auctionContract is ready, we'll register our Solidity event listener on Auction.bid()
  useEffect(() => {
    let subscription;

    if (auctionData.auctionContract) {
      subscription = auctionData.auctionContract.events.Bid({}, (err, res) => {
        if (err) {
          console.log(
            `auction contract address is ${auctionData.auctionContract._address}`
          );
          console.error("Error listening to Bid event:", err);
          console.log(err.data);
          return;
        }

        if (res && res.returnValues) {
          try {
            setHighestBid(parseInt(res.returnValues.amount));
            setHighestBidder(res.returnValues.sender);
          } catch (err) {
            console.error("Error setting highest bid or bidder:", err);
          }
        }
      });
    }

    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, [auctionData.auctionContract]);

  const handleBidAmountChange = (event) => {
    setCurrBidAmount(event.target.value * Math.pow(10, 9));
  };

  const handleSubmitBid = async () => {
    setSubmitBidLoading(true);
    if (currBidAmount <= 0) {
      enqueueSnackbar("Please enter a valid bid amount", { variant: "error" });
      setSubmitBidLoading(false);
      return;
    }

    if (currBidAmount < highestBid) {
      enqueueSnackbar("Bid amount is lower than highest bid", {
        variant: "error",
      });
      setSubmitBidLoading(false);
      return;
    } else if (
      currBidAmount - highestBid < auctionData.increment &&
      accounts[0] !== auctionData.highestBidder
    ) {
      enqueueSnackbar(
        "Bid amount should be greater than highest bid + increment!",
        { variant: "warning" }
      );
      setSubmitBidLoading(false);
      return;
    } else {
      let sendAmount = currBidAmount - auctionData.userBidAmount;
      console.log(currBidAmount, auctionData.userBidAmount, sendAmount);
      const auctionContract = auctionData.auctionContract;

      try {
        console.log(`sending amount = ${sendAmount}`);
        await auctionContract.methods
          .bid()
          .send({ from: accounts[0], value: sendAmount });
        enqueueSnackbar("Successfully submitted bid!", { variant: "success" });
        setSubmitBidLoading(false);
        await insertIntoNftBids(auctionData.nftId, accounts[0], currBidAmount);

        auctionData.userBidAmount = currBidAmount;
        setRole("highestBidder");
        console.log(auctionData.userBidAmount);
      } catch (err) {
        enqueueSnackbar(getRPCErrorMessage(err), { variant: "error" });
        setSubmitBidLoading(false);
      }
    }
  };

  const handleStartAuction = async () => {
    if (auctionData.started) {
      enqueueSnackbar("Auction already started!", { variant: "error" });
      return;
    }

    setStartLoading(true);

    const auctionContract = auctionData.auctionContract;
    try {
      await auctionContract.methods.start().send({ from: accounts[0] });
      setStartLoading(false);
      enqueueSnackbar("Auction Successfully Started", { variant: "success" });
      handleClose();
    } catch (err) {
      enqueueSnackbar(getRPCErrorMessage(err), { variant: "error" });
      setStartLoading(false);
    }
  };

  const handleWithdraw = async () => {
    setWithdrawLoading(true);
    if (highestBidder === accounts[0]) {
      enqueueSnackbar("You are the highest bidder! You cannot withdraw!", {
        variant: "error",
      });
      setWithdrawLoading(false);
      return;
    }
    if (highestBidder === "0x0000000000000000000000000000000000000000") {
      enqueueSnackbar("No one has placed any bid yet!", {
        variant: "error",
      });
      setWithdrawLoading(false);
      return;
    }
    const auctionContract = auctionData.auctionContract;
    try {
      await auctionContract.methods.withdraw().send({ from: accounts[0] });
      enqueueSnackbar("Successfully withdrew your bid amount", {
        variant: "success",
      });
      setWithdrawLoading(false);
      handleClose();
    } catch (err) {
      enqueueSnackbar(getRPCErrorMessage(err), { variant: "error" });
      setWithdrawLoading(false);
    }
  };

  const handleEndAuction = async () => {
    if (auctionData.ended) {
      enqueueSnackbar("Auction already ended!", { variant: "error" });
      return;
    }

    setEndLoading(true);

    if (
      accounts[0] !== auctionData.seller &&
      accounts[0] !== auctionData.highestBidder
    ) {
      enqueueSnackbar("You are not the seller nor highest bidder", {
        variant: "error",
      });
      return;
    }
    if (auctionData.endAt > Math.floor(Date.now() / 1000)) {
      enqueueSnackbar("Auction is not over yet", { variant: "error" });
      setEndLoading(false);
      return;
    }
    const auctionContract = auctionData.auctionContract;
    try {
      await auctionContract.methods.end().send({ from: accounts[0] });
      setEndLoading(false);
      console.log(
        auctionData.nftId,
        auctionData.seller,
        auctionData.highestBidder,
        currBidAmount
      );
      await insertIntoNftSales(
        auctionData.nftId,
        auctionData.seller,
        auctionData.highestBidder,
        currBidAmount
      );

      enqueueSnackbar("Successfully ended the auction!", {
        variant: "success",
      });
      handleClose();
    } catch (err) {
      enqueueSnackbar(getRPCErrorMessage(err), { variant: "error" });
      setEndLoading(false);
    }
  };

  return (
    <>
      {!(auctionData.started && auctionData.ended) && (
        <Button onClick={handleOpen}>Open</Button>
      )}
      <Modal open={open} onClose={handleClose}>
        <Box sx={style}>
          <Box
            sx={{
              marginLeft: "14px",
            }}
          >
            <CustomTypography
              id="modal-modal-title"
              variant="h6"
              component="h2"
            >
              Title: {pinataMetadata.name}
            </CustomTypography>
            <CustomTypography id="modal-modal-description" sx={{ mt: 2 }}>
              Highest Bid: {displayInGwei(highestBid)} gwei
            </CustomTypography>
            <CustomTypography id="modal-modal-description" sx={{ mt: 2 }}>
              Time Till Expiry:{" "}
              {auctionData.ended ? (
                <span>
                  <i>Auction has already ended</i>
                </span>
              ) : auctionData.started ? (
                <CountdownTimer
                  initialHour={timeTillExpiryHours}
                  initialMinute={timeTillExpiryMinutes}
                  initialSecond={timeTillExpirySeconds}
                />
              ) : (
                <span>
                  <i>Auction has not yet started</i>
                </span>
              )}
            </CustomTypography>
            <hr />
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                gap: "10px",
                alignItems: "center",
              }}
            >
              <Box
                display="flex"
                flexDirection="column"
                alignItems="center"
                gap="10px"
              >
                {role === "seller" && (
                  <>
                    {!auctionData.started &&
                      !auctionData.ended &&
                      !startLoading && (
                        <CustomTypography>
                          As the seller, you can{" "}
                          <Button
                            variant="contained"
                            onClick={handleStartAuction}
                          >
                            Start
                          </Button>
                        </CustomTypography>
                      )}
                    {auctionData.started &&
                      !auctionData.ended &&
                      !endLoading && (
                        <CustomTypography>
                          As the seller, you can{" "}
                          <Button
                            variant="contained"
                            onClick={handleEndAuction}
                          >
                            End
                          </Button>
                        </CustomTypography>
                      )}
                  </>
                )}
                {(startLoading || endLoading) && (
                  <Box
                    position="relative"
                    display="flex"
                    flexDirection="column"
                    alignItems="center"
                    justifyContent="center"
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
                {(role === "notBidder" || role === "bidder") && (
                  <Box
                    display="flex"
                    flexDirection="row"
                    gap="16px"
                    sx={{ marginTop: "16px" }}
                  >
                    <TextField
                      id="modal-bid"
                      label="My Bid (GWei)"
                      type="number"
                      variant="outlined"
                      required
                      min={0}
                      size="small"
                      onChange={handleBidAmountChange}
                    />
                    <Button
                      variant="contained"
                      disabled={submitBidLoading}
                      onClick={handleSubmitBid}
                    >
                      {submitBidLoading ? (
                        <Box
                          position="relative"
                          display="flex"
                          flexDirection="column"
                          alignItems="center"
                          justifyContent="center"
                          width="100%"
                          height="100%"
                        >
                          <CircularProgress
                            size={24}
                            sx={{
                              color: "#FF9900",
                              position: "absolute",
                              top: "50%",
                              left: "50%",
                              marginTop: "-12px",
                              marginLeft: "-12px",
                            }}
                          />
                        </Box>
                      ) : (
                        "Submit Bid"
                      )}
                    </Button>
                  </Box>
                )}

                {role !== "seller" && role !== "highestBidder" && (
                  <Box display="flex" sx={{ marginTop: "16px" }}>
                    <CustomTypography>
                      No longer interested?
                      <Button
                        variant="contained"
                        disabled={withdrawLoading}
                        onClick={handleWithdraw}
                        sx={{ marginLeft: "12px" }}
                      >
                        {withdrawLoading ? (
                          <Box
                            position="relative"
                            display="flex"
                            flexDirection="column"
                            alignItems="center"
                            justifyContent="center"
                          >
                            <CircularProgress
                              size={24}
                              sx={{
                                color: "#FF9900",
                              }}
                            />
                          </Box>
                        ) : (
                          "Withdraw"
                        )}
                      </Button>
                    </CustomTypography>
                  </Box>
                )}
              </Box>
            </Box>
          </Box>
        </Box>
      </Modal>
    </>
  );
}

export default NFTListingBidModal;
