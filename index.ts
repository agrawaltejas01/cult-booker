import axios from "axios";
import fs from "fs";

import express from "express";
import cors from "cors";
import classPickerTs from "./class-picker.ts";

const app = express();
const port = 8080;

app.use(cors());

const GCL_AW = `GCL.1720015325.Cj0KCQjw7ZO0BhDYARIsAFttkCgo7QojTnZj_nFmNrOvFHxNHR9nCnIhsX-p-WZlxvj9yUs8D47hfisaAiIcEALw_wcB`;

interface ICreds {
  authCookie: string;
  deviceId: string;
  gclAw?: string;
  person: string;
}

async function bookCultClass(creds: ICreds) {
  const classList = await getClasses(creds);
  let classToBook = classPickerTs(creds.person, classList);

  console.log(classToBook);

  let classBooked = false;
  if (classToBook?.classFound) {
    console.log(classToBook.classFound);
    await bookClass(creds, classToBook.classFound);
    classBooked = true;
  }
  return { logs: classToBook?.logs, classBooked };
}

async function getClasses(creds: ICreds) {
  const response = await axios.get("https://www.cult.fit/api/cult/classes", {
    params: {
      center: "6",
    },
    headers: {
      accept: "application/json",
      "accept-language": "en-US,en;q=0.9,es;q=0.8",
      apikey: "9d153009-e961-4718-a343-2a36b0a1d1fd",
      appversion: "7",
      browsername: "Web",
      "content-type": "application/json",
      cookie: `at=${creds.authCookie}; deviceId=${creds.deviceId}; _gcl_aw=${
        creds.gclAw || GCL_AW
      }; `,
      "if-none-match": 'W/"69a3-zZxu5qN6FId3Q9YAz76vuKBLaZY"',
      osname: "browser",
      priority: "u=1, i",
      referer:
        "https://www.cult.fit/cult/classbooking?pageFrom=cultCLP&pageType=classbooking",
      "sec-ch-ua":
        '"Not/A)Brand";v="8", "Chromium";v="126", "Google Chrome";v="126"',
      "sec-ch-ua-mobile": "?0",
      "sec-ch-ua-platform": '"macOS"',
      "sec-fetch-dest": "empty",
      "sec-fetch-mode": "cors",
      "sec-fetch-site": "same-origin",
      timezone: "Asia/Kolkata",
      "user-agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
      "x-request-id": "678fb11f-5250-b14b-1f8e-daee740bcfb5",
    },
  });

  fs.writeFileSync("output.json", JSON.stringify(response.data));
  return response.data;
}

async function bookClass(creds: ICreds, data: any) {
  let payload = {
    classId: data.id,
    productType: data.productType,
    classType: "MEMBERSHIP",
  };
  console.log(payload);

  try {
    const response = await axios.post(
      `https://www.cult.fit/api/cult/class/${data.id}/book`,
      payload,
      {
        headers: {
          accept: "application/json",
          "accept-language": "en-US,en;q=0.9,es;q=0.8",
          apikey: "9d153009-e961-4718-a343-2a36b0a1d1fd",
          appversion: "7",
          browsername: "Web",
          "content-type": "application/json",
          cookie: `at=${creds.authCookie}; deviceId=${
            creds.deviceId
          }; _gcl_aw=${creds.gclAw || GCL_AW};`,
          origin: "https://www.cult.fit",
          osname: "browser",
          priority: "u=1, i",
          referer:
            "https://www.cult.fit/cult/classbooking?pageFrom=cultCLP&pageType=classbooking",
          "sec-ch-ua":
            '"Not/A)Brand";v="8", "Chromium";v="126", "Google Chrome";v="126"',
          "sec-ch-ua-mobile": "?0",
          "sec-ch-ua-platform": '"macOS"',
          "sec-fetch-dest": "empty",
          "sec-fetch-mode": "cors",
          "sec-fetch-site": "same-origin",
          timezone: "Asia/Kolkata",
          "user-agent":
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
          "x-request-id": "61ddca0f-8c8d-518d-97ea-6af5f28a48be",
        },
      }
    );

    console.log(response.data);

    if (response.data && response.data.type == "Error") {
      throw new Error(response.data.title);
    }
  } catch (e: any) {
    if (e.response && e.response.data) {
      console.log(e.response.data);
    } else console.log(e.message);
  }
}

app.listen(port, () => {
  console.log(`Listening on port ${port}...`);
});

app.get("/tejas", (req, res) => {
  let creds: ICreds = {
    authCookie: `s%3ACFAPP%3A63faaeb2-08d6-417a-9df0-3893935b468b.Qy70kzMw0HeGMPtDe%2BfE5iXm95iNsvttjDNwMGwXyIQ`,
    deviceId: `s%3Af427fac4-8780-4c06-aedd-aa337d517a8e.dtofZq4ztc6yIgdcgZQ9L6Vgrji0LqNl33lGGiWks2g`,
    gclAw: `GCL.1720015325.Cj0KCQjw7ZO0BhDYARIsAFttkCgo7QojTnZj_nFmNrOvFHxNHR9nCnIhsX-p-WZlxvj9yUs8D47hfisaAiIcEALw_wcB`,
    person: "Tejas",
  };
  bookCultClass(creds)
    .then((result) => res.json({ ...result }))
    .catch((e) => {
      error: e;
    });
});
app.get("/shubham", (req, res) => {
  let creds: ICreds = {
    authCookie: `s%3ACFAPP%3Afe66204c-fa63-40f0-8a8b-bc5d2c4e47cc.JFF2cyyv%2BHhyoZbGUH2yK8aGVUBcFcNDtM4hYwVAgIk`,
    deviceId: `s%3A6f34a825-1102-4a60-b678-9b9ddd399e86.v60Fyi2z2E4cWtrkaBNorvZf1mnOfl0Vow%2BJYy8JYxo`,
    gclAw: `GCL.1720015325.Cj0KCQjw7ZO0BhDYARIsAFttkCgo7QojTnZj_nFmNrOvFHxNHR9nCnIhsX-p-WZlxvj9yUs8D47hfisaAiIcEALw_wcB`,
    person: "Shubham",
  };

  bookCultClass(creds)
    .then((result) => res.json({ ...result }))
    .catch((e) => {
      error: e;
    });
});
