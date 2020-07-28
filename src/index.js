import React from "react";
import { render } from "react-dom";
import * as a2o from "@abcnews/alternating-case-to-object";
import { App } from "./components/App";
import { EmbedContainer } from "@abcnews/story-lab-component-library";
import { prefixedMountSelector } from '@abcnews/mount-utils'

const domready = fn => {
  /in/.test(document.readyState) ? setTimeout(() => domready(fn), 9) : fn();
};

const renderEmbed = () =>
  [...document.querySelectorAll(prefixedMountSelector('dayssince'))].map(
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
          <EmbedContainer embed={props.embed}>
            <App {...props} />
          </EmbedContainer>
        ) : (
          <App {...props} />
        ),
        mountEl
      );
    }
  );

domready(renderEmbed);
