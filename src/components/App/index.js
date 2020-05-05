import React, { useEffect, useState } from "react";
import styles from "./styles.scss";
import worm from "./worm.svg";
import { csvParse } from "d3-dsv";
import { parse, differenceInDays } from "date-fns";
const dataUrl =
  "https://covid-sheets-mirror.web.app/api?sheet=1nUUU5zPRPlhAXM_-8R7lsMnAkK4jaebvIL5agAaKoXk&range=Daily%20Count%20States!A:E";

const promiseChainSpy = d => {
  console.log(d);
  return d;
};

const today = new Date();

export default props => {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch(dataUrl)
      .then(res => res.text())
      .then(csvParse)
      .then(promiseChainSpy)
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
      .then(promiseChainSpy)
      .then(setData);
  }, []);

  return data ? (
    <div className={styles.root}>
      <img className={styles.worm} src={worm} />
      <h1>Days since the last reported case of COVID-19</h1>
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          textAlign: "center",
          marginBottom: "3rem"
        }}
      >
        {data.map(({ days, jurisdiction }) => (
          <div
            key={jurisdiction}
            style={{
              padding: "1rem",
              margin: "0.4rem",
              width: "4rem",
              background: "rgba(255,255,255,0.3)",
              color: "#000"
            }}
          >
            <h2
              style={{
                marginTop: 0,
                marginBottom: "0.5rem",
                paddingBottom: "0.5rem",
                borderBottom: "1px solid #fff"
              }}
            >
              {jurisdiction}
            </h2>
            <div style={{ fontSize: "3rem" }}>{days}</div>
          </div>
        ))}
      </div>
    </div>
  ) : (
    <div>"Loading"</div>
  );
};
