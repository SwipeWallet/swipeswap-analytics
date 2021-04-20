import { Avatar } from "@material-ui/core";
import HelpIcon from "@material-ui/icons/Help";
import { makeStyles } from "@material-ui/core/styles";
import { toChecksumAddress } from "web3-utils";
import { useMemo } from "react";
import { BASE_ASSET } from "app/core/constants";
const useStyles = makeStyles((theme) => ({
  root: {
    marginRight: theme.spacing(2),
    // background: "transparent",
    color: theme.palette.text.secondary,
  },
}));

export default function TokenIcon({ id, ...rest }) {
  const classes = useStyles();
  const src = useMemo(
    () =>
      `https://raw.githubusercontent.com/swipewallet/assets/master/blockchains/${BASE_ASSET}/assets/${toChecksumAddress(
        id
      )}/logo.png`,
    [id]
  );
  return <Avatar classes={{ root: classes.root }} src={src} {...rest} />;
}
