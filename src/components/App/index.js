import React, { useEffect, useState } from "react";
import styles from "./styles.scss";
import worm from "./worm.svg";
import { csvParse } from "d3-dsv";
import { parse, format } from "date-fns";

// If this is ever revived the new data source is probably https://www.abc.net.au/dat/news/interactives/covid19-data/federal-government-data.csv
const dataUrl =
  "https://covid-sheets-mirror.web.app/api?sheet=1nUUU5zPRPlhAXM_-8R7lsMnAkK4jaebvIL5agAaKoXk&range=Daily%20Count%20States!A:E";
const metadataUrl =
  "https://covid-sheets-mirror.web.app/api?sheet=1nUUU5zPRPlhAXM_-8R7lsMnAkK4jaebvIL5agAaKoXk&range=Metadata";

const promiseChainSpy = (d) => {
  console.log(d);
  return d;
};

const descending = (accessor = (d) => d) => (a, b) =>
  accessor(a) > accessor(b) ? -1 : accessor(b) > accessor(a) ? 1 : 0;

const ascending = (accessor = (d) => d) => (a, b) =>
  accessor(a) < accessor(b) ? -1 : accessor(b) < accessor(a) ? 1 : 0;

export const App = (props) => {
  const [data, setData] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);

  useEffect(() => {
    fetch(dataUrl)
      .then((res) => res.text())
      .then(csvParse)
      .then((raw) =>
        raw
          .map((d) => ({
            date: parse(d["Date announced"], "dd/MM/yyyy", new Date()),
            added: d["New cases"] === "" ? null : +d["New cases"],
            jurisdiction: d["State/territory"],
          }))
          .sort(descending((d) => +d.date))
      )
      .then((raw) =>
        raw.reduce((m, { jurisdiction, added, date }) => {
          const count = m.get(jurisdiction);

          // If we've finished counting this jurisdiction just return it.
          if (count && count.done) return m;

          if (added === 0) {
            m.set(jurisdiction, { val: count ? count.val + 1 : 1 });
          }

          if (added > 0) {
            m.set(jurisdiction, { val: count ? count.val : 0, done: true });
          }

          return m;
        }, new Map())
      )
      .then((map) => {
        const daysSince = [];
        map.forEach((count, jurisdiction) =>
          daysSince.push({ days: count.val, jurisdiction })
        );
        return daysSince.sort(ascending((d) => d.days));
      })
      .then(setData);
  }, []);

  useEffect(() => {
    fetch(metadataUrl)
      .then((res) => res.text())
      .then(csvParse)
      .then((data) => {
        return setLastUpdate(
          parse(data[1].Value, "dd/MM/yyyy HH:mm:ss", new Date())
        );
      });
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
          textAlign: "center",
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
