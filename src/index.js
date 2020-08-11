import React from "react";
import { render } from "react-dom";
import * as a2o from "@abcnews/alternating-case-to-object";
import { App } from "./components/App";
import { EmbedContainer } from "@abcnews/story-lab-component-library";
import { selectMounts, getMountValue } from '@abcnews/mount-utils'

const domready = fn => {
  /in/.test(document.readyState) ? setTimeout(() => domready(fn), 9) : fn();
};

const renderEmbed = () =>
  selectMounts('dayssince')
    .map(mountEl => {
      const props = a2o(getMountValue(mountEl));
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
