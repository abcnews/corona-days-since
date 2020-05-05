import React, { useEffect, useState } from "react";
import styles from "./styles.scss";
import worm from "./worm.svg";
import { csvParse } from "d3-dsv";
import { parse, format, differenceInDays } from "date-fns";
const dataUrl =
  "https://covid-sheets-mirror.web.app/api?sheet=1nUUU5zPRPlhAXM_-8R7lsMnAkK4jaebvIL5agAaKoXk&range=Daily%20Count%20States!A:E";
const metadataUrl =
  "https://covid-sheets-mirror.web.app/api?sheet=1nUUU5zPRPlhAXM_-8R7lsMnAkK4jaebvIL5agAaKoXk&range=Metadata";

const promiseChainSpy = d => {
  console.log(d);
  return d;
};

const today = new Date();

export const App = props => {
  const [data, setData] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);

  useEffect(() => {
    fetch(dataUrl)
      .then(res => res.text())
      .then(csvParse)
      .then(raw =>
        raw.map(d => ({
          date: parse(d["Date announced"], "dd/MM/yyyy", new Date()),
          added: d["New cases"] === "" ? null : +d["New cases"],
          jurisdiction: d["State/territory"]
        }))
      )
      .then(raw =>
        raw.reduce((m, { jurisdiction, added, date }) => {
          if (added === null || added === 0) return m;
          if (+m.get(jurisdiction) > +date) return m;
          m.set(jurisdiction, date);
          return m;
        }, new Map())
      )
      .then(map => {
        const daysSince = [];
        map.forEach((date, jurisdiction) =>
          daysSince.push({ days: differenceInDays(today, date), jurisdiction })
        );
        return daysSince;
      })
      .then(setData);
  }, []);

  useEffect(() => {
    fetch(metadataUrl)
      .then(res => res.text())
      .then(csvParse)
      .then(data =>
        setLastUpdate(parse(data[1].Value, "dd/MM/yyyy HH:mm:ss", new Date()))
      );
  }, []);

  return data ? (
    <div className={styles.root}>
      <h3 className={styles.title}>
        Days since the last reported case of COVID-19
      </h3>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          flexWrap: "wrap",
          textAlign: "center"
        }}
      >
        {data.map(({ days, jurisdiction }) => (
          <div key={jurisdiction} className={styles.state}>
            <h4 className={styles.stateTitle}>{jurisdiction}</h4>
            <div className={styles.stateCount}>{days}</div>
          </div>
        ))}
      </div>
      {lastUpdate ? (
        <p className={styles.lastUpdate}>
          Last updated {format(lastUpdate, "H:mm a 'AEST on' EEEE, MMMM d")}
        </p>
      ) : null}
    </div>
  ) : null;
};
