import { useEth } from "./contexts/EthContext";
import { getAuctionFactoryContract, getAuctions } from "./utils";

import Account from "./components/Account";
import NFTUpload from "./components/NFTUpload";
import NFTAIGenerated from "./components/NFTAIGenerated";
import ConfirmationModal from "./components/ConfirmationModal";

import PageHeader from "./components/PageHeader";
import PageTitleWrapper from "./components/PageTitleWrapper";
import {
  Box,
  alpha,
  lighten,
  Container,
  Grid,
  Button,
  useTheme,
} from "@mui/material";

import RootHeader from "./components/RootHeader";
import Listing from "./components/Listing";
import { useEffect, useState } from "react";
import { useSnackbar } from "notistack";
import ReactCardFlip from "react-card-flip";

function AuctionApp() {
  const [showNFTUpload, setShowNFTUpload] = useState(true);
  const { enqueueSnackbar } = useSnackbar();
  const theme = useTheme();
  const [auctionFactoryContract, setAuctionFactoryContract] = useState(null);
  const [auctions, setAuctions] = useState([]);
  const {
    state: { auctionFactoryJson, web3auth, web3, networkID, accounts },
  } = useEth();
  const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false);
  const [confirmationMessage, setConfirmationMessage] = useState("");
  const [confirmationCallback, setConfirmationCallback] = useState(null);
  const [cancelCallback, setCancelCallback] = useState(null);

  useEffect(() => {
    console.log(
      `auctionFactoryJson: ${auctionFactoryJson}, web3auth: ${web3auth}, web3: ${web3}, networkID: ${networkID}, accounts: ${accounts}`
    );
  }, [auctionFactoryJson, web3auth, web3, networkID, accounts]);

  const openConfirmationModal = (message, confirmCallback, cancelCallback) => {
    setConfirmationMessage(message);
    setIsConfirmationModalOpen(true);
    if (confirmCallback) {
      setConfirmationCallback(() => confirmCallback);
    }
    if (cancelCallback) {
      setCancelCallback(() => cancelCallback);
    }
  };

  const handleConfirm = () => {
    if (confirmationCallback) {
      confirmationCallback();
      setConfirmationCallback(null);
    }
    closeConfirmationModal();
  };

    const handleCancel = () => {
      if (cancelCallback) {
        cancelCallback();
        setCancelCallback(null);
      }
      closeConfirmationModal();
    };

  const closeConfirmationModal = () => {
    setIsConfirmationModalOpen(false);
  };

  const handleFlip = () => {
    setShowNFTUpload(!showNFTUpload);
  };

  useEffect(() => {
    var scrollToTopBtn = document.querySelector(".scrollToTopBtn");
    var rootElement = document.documentElement;
    const scrollFunction = () => {
      if (rootElement.scrollTop > 300) {
        scrollToTopBtn.classList.add("showBtn");
      } else {
        scrollToTopBtn.classList.remove("showBtn");
      }
    };

    function scrollToTop() {
      rootElement.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }
    scrollToTopBtn.addEventListener("click", scrollToTop);
    window.onscroll = function () {
      scrollFunction();
    };
  });

  useEffect(() => {
    if (web3 && networkID) {
      setAuctionFactoryContract(getAuctionFactoryContract(web3, networkID));
    }
  }, [web3, networkID]);

  useEffect(() => {
    async function fetchData() {
      const auctions = await getAuctions(
        web3,
        auctionFactoryContract,
        accounts
      );
      setAuctions(auctions);
    }
    if (auctionFactoryContract) {
      fetchData();
    }
  }, [auctionFactoryContract, web3, accounts]);

  async function refetchData() {
    const auctions = await getAuctions(web3, auctionFactoryContract, accounts);
    setAuctions(auctions);
    enqueueSnackbar("Auctions refreshed", {
      variant: "success",
    });
  }

  return (
    <Box
      sx={{
        flex: 1,
        height: "100%",
        ".MuiPageTitle-wrapper": {
          background: theme.colors.alpha.trueWhite[5],
          marginBottom: `${theme.spacing(4)}`,
          boxShadow:
            theme.palette.mode === "dark"
              ? `0 1px 0 ${alpha(
                  lighten(theme.colors.primary.main, 0.7),
                  0.15
                )}, 0px 2px 4px -3px rgba(0, 0, 0, 0.2), 0px 5px 12px -4px rgba(0, 0, 0, .1)`
              : `0px 2px 4px -3px ${alpha(
                  theme.colors.alpha.black[100],
                  0.1
                )}, 0px 5px 12px -4px ${alpha(
                  theme.colors.alpha.black[100],
                  0.05
                )}`,
        },
      }}
    >
      <RootHeader
        web3auth={web3auth}
        web3={web3}
        networkID={networkID}
        accounts={accounts}
      />
      <PageTitleWrapper>
        <PageHeader refetchData={refetchData} />
      </PageTitleWrapper>
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          <Grid item xs={12}>
            <div
              className="button-card-container"
              style={{ display: "flex", justifyContent: "center" }}
            >
              <Button variant="contained" onClick={handleFlip}>
                Flip
              </Button>
              <div style={{ width: "50%", height: "50%" }}>
                <ReactCardFlip
                  isFlipped={showNFTUpload}
                  flipDirection="horizontal"
                >
                  <div style={{ width: "100%", height: "100%" }}>
                    <NFTUpload
                      auctionFactoryJson={auctionFactoryJson}
                      web3={web3}
                      networkID={networkID}
                      accounts={accounts}
                      refetchData={refetchData}
                      openConfirmationModal={openConfirmationModal}
                    />
                  </div>
                  <div style={{ width: "100%", height: "100%" }}>
                    <NFTAIGenerated
                      auctionFactoryJson={auctionFactoryJson}
                      web3={web3}
                      networkID={networkID}
                      accounts={accounts}
                      refetchData={refetchData}
                      openConfirmationModal={openConfirmationModal}
                    />
                  </div>
                </ReactCardFlip>
              </div>
            </div>
          </Grid>
          <Grid item xs={12}>
            <Account auctions={auctions} />
          </Grid>
          <Grid item xs={12}>
            <Listing
              auctions={auctions}
              refetchData={refetchData}
              openConfirmationModal={openConfirmationModal}
            />
          </Grid>
        </Grid>
      </Container>
      <button className="scrollToTopBtn cursor-pointer">☝️</button>
      <ConfirmationModal
        isConfirmationModalOpen={isConfirmationModalOpen}
        handleConfirm={handleConfirm}
        handleCancel={handleCancel}
        closeConfirmationModal={closeConfirmationModal}
        confirmationMessage={confirmationMessage}
      />
    </Box>
  );
}

export default AuctionApp;
