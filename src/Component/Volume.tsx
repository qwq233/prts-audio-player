import React from "react";
import Slider from "@material-ui/core/Slider";
import VolumeOffIcon from "@material-ui/icons/VolumeOff";
import VolumeMuteIcon from "@material-ui/icons/VolumeMute";
import VolumeUpIcon from "@material-ui/icons/VolumeUp";
import { IconButton, makeStyles } from "@material-ui/core";
interface props {
  vol: number;
  mute: boolean;
  onMute: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
  onChange: (event: React.ChangeEvent<{}>, value: number | number[]) => void;
}
const useStyles = makeStyles({
  root: {
    display: "flex",
    marginRight: "12px",
  },
  col: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
  },
});
export function Volume(props: props) {
  const classes = useStyles();
  return (
    <div className={classes.root}>
      <div className={classes.col}>
        <IconButton onClick={props.onMute} size="small">
          {props.mute ? (
            <VolumeMuteIcon />
          ) : props.vol === 0 ? (
            <VolumeOffIcon />
          ) : (
            <VolumeUpIcon />
          )}
        </IconButton>
      </div>
      <div className={classes.col}>
        <Slider
          style={{ width: 60 }}
          value={props.vol}
          valueLabelDisplay="auto"
          disabled={props.mute}
          onChange={props.onChange}
        ></Slider>
      </div>
    </div>
  );
}
