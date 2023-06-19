import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import { CssBaseline } from "@material-ui/core";
import Header from "./components/Header";
import Explainer from "./components/Explainer";
import { Helmet } from "react-helmet-async";

const useStyles = makeStyles((theme) => ({
  root: {
    minHeight: "100vh",
    backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url(assets/nft4.webp)`,
    backgroundRepeat: "no-repeat",
    backgroundSize: "cover",
    overflowX: "hidden",
  },
  mid: {
    textAlign: "center",
    color: "white",
    fontSize: "1rem",
    fontFamily: "Google Sans, sans-serif",
  },
  title: {
    fontFamily: "Google Sans, sans-serif",
  },
}));

export default function Landing() {
  const classes = useStyles();
  return (
    <div className={classes.root}>
      <Helmet>
        <title>NFT Auction</title>
        <meta charSet="utf-8" />
        <meta name="description" content="NFT Auction" />
        <link
          href="https://fonts.googleapis.com/css2?family=Google+Sans:wght@400;600&display=swap"
          rel="stylesheet"
        />
      </Helmet>
      <CssBaseline />
      <Header />
      <div className={classes.mid}>
        <h1 className={classes.title}>
          Sell & Bid on NFT Auctions Governed by Smart Contracts
        </h1>
      </div>
      <Explainer />
    </div>
  );
}
