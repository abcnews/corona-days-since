// import "regenerator-runtime/runtime.js";
// import "core-js/features/symbol";
// import "core-js/features/symbol/iterator";

import React from "react";
import { render } from "react-dom";
import * as a2o from "@abcnews/alternating-case-to-object";
import { App } from "./components/App";
import Embed from "./components/Embed";

const domready = fn => {
  /in/.test(document.readyState) ? setTimeout(() => domready(fn), 9) : fn();
};

const renderEmbed = () =>
  [...document.querySelectorAll(`a[id^=dayssince],a[name^=dayssince]`)].map(
    anchorEl => {
      const props = a2o(
        anchorEl.getAttribute("id") || anchorEl.getAttribute("name")
      );
      const mountEl = document.createElement("div");

      Object.keys(props).forEach(
        propName => (mountEl.dataset[propName] = props[propName])
      );

      anchorEl.parentElement.insertBefore(mountEl, anchorEl);
      anchorEl.parentElement.removeChild(anchorEl);

      render(
        props.embed ? (
          <Embed embed={props.embed}>
            <App {...props} />
          </Embed>
        ) : (
          <App {...props} />
        ),
        mountEl
      );
    }
  );

domready(renderEmbed);
