import React, { useState } from "react";
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import Typography from "@material-ui/core/Typography";
import { makeStyles } from "@material-ui/core/styles";
import {
  CardActions,
  Dialog,
  DialogContent,
  DialogTitle,
  FormControl,
  IconButton,
  InputLabel,
  List,
  ListItem,
  NativeSelect,
  Tooltip,
} from "@material-ui/core";
import PlayArrowIcon from "@material-ui/icons/PlayArrow";
import PauseIcon from "@material-ui/icons/Pause";
import AutorenewIcon from "@material-ui/icons/Autorenew";
import GetAppIcon from "@material-ui/icons/GetApp";
import { Volume } from "./Volume";
import { downloadFile } from "../Utils/dl";
import Slider from "@material-ui/core/Slider";
import { useAudio, PlayState, PlayerAction, Audio } from "../Hooks/useAudio";
import { sec2str } from "../Utils/time";
import CircularProgress from "@material-ui/core/CircularProgress";
const useStyles = makeStyles({
  root: {
    maxWidth: 800,
    padding: 8,
  },
  header: {
    display: "flex",
    flexWrap: "wrap",
    padding: 0,
  },
  slider: {
    flex: "1",
    marginLeft: 12,
  },
  control: {
    display: "flex",
    // margin: 8,
    // flexWrap: "wrap",
  },
  quality: {
    marginLeft: 8,
    width: 65,
  },
  sliderGroup: {
    display: "flex",
    // margin: 8,
  },
});
interface props {
  name: string;
  title?: string;
  lowSource: string;
  highSource: string;
  p?: number;
}
enum Quality {
  High,
  Low,
}
function App(props: props) {
  const classes = useStyles();
  const [quality, setQuality] = useState(Quality.Low);
  const low = useAudio(props.lowSource, props.p);
  const high = useAudio(props.highSource, props.p);
  const [dl, setdl] = useState(false);
  function getAudio(): Audio {
    if (quality === Quality.Low) {
      return low;
    }
    return high;
  }
  const playIconHandler = () => {
    var audio;
    if (quality === Quality.Low) {
      audio = low;
    } else {
      audio = high;
    }
    switch (audio.state) {
      case PlayState.Idle:
        audio.control(PlayerAction.load);
        break;
      case PlayState.Loaded:
        audio.control(PlayerAction.play);
        break;
      case PlayState.Playing:
        audio.control(PlayerAction.pause);
        break;
      case PlayState.Paused:
        audio.control(PlayerAction.play);
        break;
    }
  };
  function playAble(): boolean {
    const s = getAudio().state;
    return s !== PlayState.Idle && s !== PlayState.Loading;
  }
  function download(q: Quality) {
    if (q === Quality.Low) {
      downloadFile(props.name + ".mp3", props.lowSource);
    } else {
      downloadFile(props.name + ".wav", props.highSource);
    }
  }
  function playIconToolTip() {
    let s = getAudio().state;
    switch (s) {
      case PlayState.Idle:
        return "开始加载";
      case PlayState.Loaded:
      case PlayState.Stopped:
        return "播放";
      case PlayState.Playing:
        return "暂停";
      case PlayState.Paused:
        return "继续播放";
    }
    return "";
  }
  return (
    <>
      <Card className={classes.root}>
        {props.name || props.title ? (
          <CardContent className={classes.header}>
            {props.title ? (
              <Typography
                variant="h5"
                component="div"
                style={{ display: "flex", alignItems: "center" }}
                dangerouslySetInnerHTML={{ __html: props.title }}
              ></Typography>
            ) : (
              <Typography
                variant="h5"
                component="div"
                style={{ display: "flex", alignItems: "center" }}
              >
                {props.title ? null : props.name}
              </Typography>
            )}
          </CardContent>
        ) : null}
        <div className={classes.sliderGroup}>
          <Typography variant="h6" component="div">{`${sec2str(
            getAudio().process
          )}/${sec2str(getAudio().len)}`}</Typography>
          <div className={classes.slider}>
            <Slider
              disabled={!playAble()}
              value={getAudio().process}
              min={0}
              max={getAudio().len}
              onChange={(_, v) => {
                getAudio().control(PlayerAction.process, v as number);
              }}
            />
          </div>
        </div>
        <div className={classes.control}>
          <Tooltip title={playIconToolTip()}>
            <IconButton onClick={playIconHandler} size="small">
              {getAudio().state === PlayState.Loading ? (
                <CircularProgress size={24} />
              ) : getAudio().state === PlayState.Playing ? (
                <PauseIcon />
              ) : (
                <PlayArrowIcon />
              )}
            </IconButton>
          </Tooltip>
          <Tooltip title={getAudio().loop ? "循环播放" : "顺序播放"}>
            <IconButton
              size="small"
              disabled={!playAble()}
              onClick={() => {
                getAudio().control(PlayerAction.changeLoop);
              }}
            >
              <AutorenewIcon color={getAudio().loop ? "primary" : "inherit"} />
            </IconButton>
          </Tooltip>
          <Volume
            mute={getAudio().mute}
            vol={getAudio().vol}
            onChange={(_, v) => {
              getAudio().control(PlayerAction.changeVol, v as number);
            }}
            onMute={(e) => {
              getAudio().control(PlayerAction.changeMute);
            }}
          />
          <IconButton
            size="small"
            onClick={() => {
              setdl(true);
            }}
          >
            <GetAppIcon />
          </IconButton>
          <FormControl className={classes.quality}>
            {/* <InputLabel htmlFor="quality">质量</InputLabel> */}
            <NativeSelect
              inputProps={{ id: "quality" }}
              variant="outlined"
              value={quality}
              onChange={(e) => {
                getAudio().control(PlayerAction.stop);
                setQuality(parseInt(e.target.value));
              }}
            >
              <option value={Quality.Low}>mp3</option>
              <option value={Quality.High}>wav</option>
            </NativeSelect>
          </FormControl>
        </div>
      </Card>
      <Dialog
        open={dl}
        onClose={() => {
          setdl(false);
        }}
      >
        <DialogTitle>下载</DialogTitle>
        <DialogContent>
          <List>
            <ListItem
              button
              onClick={() => {
                download(Quality.Low);
              }}
            >
              MP3
            </ListItem>
            <ListItem
              button
              onClick={() => {
                download(Quality.High);
              }}
            >
              WAV
            </ListItem>
          </List>
        </DialogContent>
      </Dialog>
    </>
  );
}
export default App;
