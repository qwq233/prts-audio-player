import React from "react";
import ReactDOM from "react-dom";

import AudioPlayer from "./Component/AudioPlayer";
document.addEventListener("DOMContentLoaded", function () {
  const eles = document.getElementsByClassName("audio-player");
  for (let i = 0; i < eles.length; i++) {
    ReactDOM.render(
      <AudioPlayer
        name={eles[i].getAttribute("data-name") || ""}
        lowSource={eles[i].getAttribute("data-low") || ""}
        highSource={eles[i].getAttribute("data-high") || ""}
        title={eles[i].innerHTML}
        p={parseFloat(eles[i].getAttribute("data-p") || '0')}
      />,
      eles[i]
    );
  }
});
