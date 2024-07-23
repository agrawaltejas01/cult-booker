import axios from "axios";
import fs from "fs";

import express from "express";
import cors from "cors";

const app = express();
const port = 8080;

app.use(cors());

const preferredClassTime = ["07:30:00", "08:30:00"];
const preferredClasses = ["HRX WORKOUT", "STRENGTH+"];

let AuthCookie = `s%3ACFAPP%3A63faaeb2-08d6-417a-9df0-3893935b468b.Qy70kzMw0HeGMPtDe%2BfE5iXm95iNsvttjDNwMGwXyIQ`;

async function bookCultClass() {
  const classList = await getClasses();
  let classToBook = chooseClass(classList);

  console.log(classToBook);

  let classBooked = false;
  if (classToBook?.classFound) {
    await bookClass(classToBook.classFound);
    classBooked = true;
  }
  return { logs: classToBook?.logs, classBooked };
}

async function getClasses() {
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
      cookie: `at=${AuthCookie}; deviceId=s%3Af427fac4-8780-4c06-aedd-aa337d517a8e.dtofZq4ztc6yIgdcgZQ9L6Vgrji0LqNl33lGGiWks2g; _gcl_aw=GCL.1720015325.Cj0KCQjw7ZO0BhDYARIsAFttkCgo7QojTnZj_nFmNrOvFHxNHR9nCnIhsX-p-WZlxvj9yUs8D47hfisaAiIcEALw_wcB; `,
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

function chooseClass(data: any) {
  let date4DaysAhead = new Date(new Date().setDate(new Date().getDate() + 4));
  let dateToMatch = date4DaysAhead.toISOString().split("T")[0];

  //   let dateToMatch = "2024-07-26";
  let logs = "";
  let classFound = false;

  let weekDay = new Date(dateToMatch).getDay();
  if (weekDay == 1) {
    logs = "Monday skipped";
    return { classFound, logs };
  }

  let classesOnDate = data.classByDateList.filter(
    (data: any) => data.id == dateToMatch
  );
  if (!classesOnDate.length || !classesOnDate[0].classByTimeList.length) {
    console.log(`No Classes on ${dateToMatch} -> `);
    return;
  }

  classesOnDate = classesOnDate[0];

  let isClassBooked = false;
  classesOnDate.classByTimeList.filter((classByTimeList: any) => {
    if (isClassBooked) return;
    isClassBooked = classByTimeList.classes.filter(
      (classes: any) => classes.state == "BOOKED"
    ).length;
  });

  if (isClassBooked) {
    logs = "Class already booked";
    return { classFound, logs };
  }

  preferredClassTime.forEach((time) => {
    if (classFound) return;

    let classesOnTime = classesOnDate.classByTimeList.filter(
      (classes: any) => classes.id == time
    );

    if (!classesOnTime.length) {
      logs += `No Classes on time ${time}\n`;
      return;
    }
    classesOnTime = classesOnTime[0].classes;
    classesOnTime.forEach((classes: any) => {
      if (
        preferredClasses.includes(classes.workoutName) &&
        classes.state == "AVAILABLE"
      ) {
        classFound = classes;
        return;
      } else logs += `No preferred class type for time ${time}\n`;
    });
  });

  return { classFound, logs };
}

async function bookClass(data: any) {
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
          cookie:
            "_gcl_au=1.1.32139539.1720015325; _fbp=fb.1.1720015325084.154548133943375642; G_ENABLED_IDPS=google; deviceId=s%3A2fe49434-5ba9-496d-bd76-1bef7689b794.CIiUcPLeQhFJ1lAOf4wjUV1oHSVD0xyMHaazVOIp6t0; _gcl_aw=GCL.1721457863.CjwKCAjwnei0BhB-EiwAA2xuBrhsLDXWAyWnpO8oKBn4299QDZMnUmVR_3_Bs_Y_5m_jmBNzn6Wa-RoCX_UQAvD_BwE; _gcl_gs=2.1.k1$i1721457862; _gid=GA1.2.88004728.1721457863; at=s%3ACFAPP%3A63faaeb2-08d6-417a-9df0-3893935b468b.Qy70kzMw0HeGMPtDe%2BfE5iXm95iNsvttjDNwMGwXyIQ; st=s%3ACFAPP%3A896a44fd-3536-4214-b4aa-34cedde2834e.KHSYgWWcTzXFmMawcav%2B71AB3OE60VPor495n339WWo; _gac_UA-92412423-1=1.1721457895.CjwKCAjwnei0BhB-EiwAA2xuBrhsLDXWAyWnpO8oKBn4299QDZMnUmVR_3_Bs_Y_5m_jmBNzn6Wa-RoCX_UQAvD_BwE; _ga=GA1.2.194755141.1720015325; _gat_UA-92412423-1=1; _ga_V0XZM8114H=GS1.1.1721457863.3.1.1721458092.60.0.0",
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
app.get("/", (req, res) => {
  //   res.send("Hello World!");
  bookCultClass()
    .then((result) => res.json({ ...result }))
    .catch((e) => {
      error: e;
    });
});
