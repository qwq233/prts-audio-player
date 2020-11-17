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
  const ref = useRef<Howl>();
  const loopRef = useRef<Boolean>(false);
  useEffect(() => {
    loopRef.current = loop;
  }, [loop]);
  useInterval(() => {
    if (ref.current) {
      setProcess(Math.floor(ref.current.seek() as number));
    }
  }, 50);

  const change = (action: PlayerAction, value?: number) => {
    switch (action) {
      case PlayerAction.load:
        if (!ref.current) {
          ref.current = new Howl({ src: src, preload: false });
          setState(PlayState.Loading);
          ref.current.once("load", () => {
            ref.current?.play();
            console.log(ref.current);
            setState(PlayState.Playing);
            setLen(ref.current?.duration() || -1);
          });
          ref.current.on("end", () => {
            if (!loopRef.current) {
              setState(PlayState.Loaded);
            } else {
              if (p) {
                setProcess(p);
                ref.current?.seek(p);
              }
            }
          });
        }
        ref.current.load();
        break;
      case PlayerAction.play:
        ref.current?.play();
        setState(PlayState.Playing);
        break;
      case PlayerAction.pause:
        ref.current?.pause();
        setState(PlayState.Paused);
        break;
      case PlayerAction.stop:
        ref.current?.stop();
        setProcess(0);
        setState(PlayState.Loaded);
        break;
      case PlayerAction.changeVol:
        setVol(value || 0);
        if (value) {
          ref.current?.volume(value / 100);
        } else {
          ref.current?.volume(0);
        }
        break;
      case PlayerAction.changeMute:
        ref.current?.mute(!mute);
        setMute(!mute);
        break;
      case PlayerAction.changeLoop:
        ref.current?.loop(!loop);
        setLoop(!loop);
        break;
      case PlayerAction.process:
        if (value !== undefined) {
          setProcess(value);
          ref.current?.seek(value);
        }
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
