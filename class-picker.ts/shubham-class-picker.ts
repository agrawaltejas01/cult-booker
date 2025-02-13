import { times, workouts } from "../constants";

export default function chooseClassForShubham(data: any, debugging = false) {
  let dateToMatch;

  let date4DaysAhead = new Date(new Date().setDate(new Date().getDate() + 4));
  dateToMatch = date4DaysAhead.toISOString().split("T")[0];

  if (debugging) dateToMatch = "2024-08-19";

  let logs = "";
  let classFound = false;

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

  if (!debugging)
    if (isClassBooked) {
      logs = "Class already booked";
      return { classFound, logs };
    }

  let preferredClassTime = [times[730], times[830]];
  let preferredClasses = [
    workouts.BOXING,
    workouts.HRX,
    workouts.STRENGTH,
    // workouts.BURN,
  ];
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
