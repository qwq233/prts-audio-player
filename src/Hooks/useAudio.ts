import { Howl } from "howler";
import { useEffect, useRef, useState } from "react";
import { useInterval } from "./useInterval";
export enum PlayState {
  Idle,
  Loading,
  Loaded,
  Playing,
  Paused,
  Stopped,
}
export enum PlayerAction {
  load,
  play,
  pause,
  stop,
  changeVol,
  changeMute,
  changeLoop,
  process,
}
export interface Audio {
  control: AudioControl;
  state: PlayState;
  vol: number;
  mute: boolean;
  loop: boolean;
  process: number;
  len: number;
}
type AudioControl = (action: PlayerAction, value?: number) => void;
export function useAudio(src: string, p?: number): Audio {
  const [state, setState] = useState(PlayState.Idle);
  const [vol, setVol] = useState(100);
  const [mute, setMute] = useState(false);
  const [loop, setLoop] = useState(false);
  const [process, setProcess] = useState(0);
  const [len, setLen] = useState(0);
  const refIntro = useRef<Howl>();
  const refLoop = useRef<Howl>();
  const loopRef = useRef<Boolean>(false);
  const isCombined = src.includes("_combine") && p !== undefined && p !== 0;

  useEffect(() => {
    loopRef.current = loop;
  }, [loop]);

  useInterval(() => {
    if (isCombined) {
      if (refIntro.current && refIntro.current.playing()) {
        setProcess(Math.floor(refIntro.current.seek() as number));
      } else if (refLoop.current) {
        setProcess(Math.floor(refLoop.current.seek() as number) + (refIntro.current?.duration() || 0));
      }
    } else if (refIntro.current) {
      setProcess(Math.floor(refIntro.current.seek() as number));
    }
  }, 50);

  const change = (action: PlayerAction, value?: number) => {
    switch (action) {
      case PlayerAction.load:
        if (isCombined) {
          const introSrc = src.replace("_combine", "_intro");
          const loopSrc = src.replace("_combine", "_loop");

          refIntro.current = new Howl({ src: introSrc, preload: false });
          refLoop.current = new Howl({ src: loopSrc, preload: false });

          setState(PlayState.Loading);

          refIntro.current.once("load", () => {
            refIntro.current?.play();
            setState(PlayState.Playing);
            setLen((refIntro.current?.duration() || 0) + (refLoop.current?.duration() || 0));
          });

          refIntro.current.on("end", () => {
            if (!loopRef.current) {
              setState(PlayState.Loaded);
            } else {
              refLoop.current?.play();
            }
          });

          refLoop.current.once("load", () => {
            if (loopRef.current) {
              refLoop.current?.loop(true);
            }
          });

          refIntro.current.load();
          refLoop.current.load();
        } else {
          refIntro.current = new Howl({ src: src, preload: false });
          setState(PlayState.Loading);
          refIntro.current.once("load", () => {
            refIntro.current?.play();
            setState(PlayState.Playing);
            setLen(refIntro.current?.duration() || -1);
          });
          refIntro.current.on("end", () => {
            if (!loopRef.current) {
              setState(PlayState.Loaded);
            } else {
              if (p) {
                setProcess(p);
                refIntro.current?.seek(p);
              }
            }
          });
          refIntro.current.load();
        }
        break;
      case PlayerAction.play:
        if (isCombined) {
          if (refIntro.current?.playing()) {
            refIntro.current?.play();
          } else {
            refLoop.current?.play();
          }
        } else {
          refIntro.current?.play();
        }
        setState(PlayState.Playing);
        break;
      case PlayerAction.pause:
        refIntro.current?.pause();
        refLoop.current?.pause();
        setState(PlayState.Paused);
        break;
      case PlayerAction.stop:
        refIntro.current?.stop();
        refLoop.current?.stop();
        setProcess(0);
        setState(PlayState.Loaded);
        break;
      case PlayerAction.changeVol:
        setVol(value || 0);
        if (value) {
          refIntro.current?.volume(value / 100);
          refLoop.current?.volume(value / 100);
        } else {
          refIntro.current?.volume(0);
          refLoop.current?.volume(0);
        }
        break;
      case PlayerAction.changeMute:
        refIntro.current?.mute(!mute);
        refLoop.current?.mute(!mute);
        setMute(!mute);
        break;
      case PlayerAction.changeLoop:
        if (isCombined) {
          refLoop.current?.loop(!loop);
          setLoop(!loop);
        } else {
          refIntro.current?.loop(!loop);
          setLoop(!loop);
        }
        break;
      case PlayerAction.process:
        if (value !== undefined) {
          setProcess(value);
          if (isCombined) {
            if (value < (refIntro.current?.duration() || 0)) {
              refIntro.current?.seek(value);
            } else {
              refLoop.current?.seek(value - (refIntro.current?.duration() || 0));
            }
          } else {
            refIntro.current?.seek(value);
          }
        }
        break;
      default:
        break;
    }
  };

  return {
    control: change,
    vol,
    mute,
    state,
    loop,
    process,
    len,
  };
}
