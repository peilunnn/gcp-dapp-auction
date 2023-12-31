import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';

import CardContent from '@material-ui/core/CardContent';
import CardMedia from '@material-ui/core/CardMedia';
import Typography from '@material-ui/core/Typography';
import { Collapse } from '@material-ui/core';
import { styled } from "@mui/system";

const CustomTypography = styled(Typography)`
  font-family: "Google Sans", sans-serif;
  font-weight: 600;
`;

const useStyles = makeStyles({
  root: {
    maxWidth: 645,
    background: 'rgba(0,0,0,0.5)',
    margin: '20px',
  },
  media: {
    height: 440,
  },
  title: {
    fontFamily: 'Nunito',
    fontWeight: 'bold',
    fontSize: '2rem',
    color: '#fff',
  },
  desc: {
    fontFamily: 'Nunito',
    fontSize: '1.6rem',
    color: '#ddd',
  },
});

export default function ImageCard({ item, checked }) {
  const classes = useStyles();

  return (
    <Collapse in={checked} {...(checked ? { timeout: 1000 } : {})}>
      <Card className={classes.root}>
        <CardMedia
          className={classes.media}
          image={item.imageUrl}
          title="Contemplative Reptile"
        />
        <CardContent>
          <CustomTypography
            gutterBottom
            variant="h5"
            component="h1"
            className={classes.title}
          >
            {item.title}
          </CustomTypography>
          <CustomTypography
            variant="body2"
            color="textSecondary"
            component="p"
            className={classes.desc}
          >
            {item.description}
          </CustomTypography>
        </CardContent>
      </Card>
    </Collapse>
  );
}
