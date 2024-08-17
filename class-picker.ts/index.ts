import chooseClassForShubham from "./shubham-class-picker";
import chooseClassForTejas from "./tejas-class-picker";

export default function (person: string, data: any) {
  let classToBook:
    | {
        classFound: boolean;
        logs: string;
      }
    | undefined;

  switch (person) {
    case "Shubham": {
      console.log("Picking class for Shubham");
      classToBook = chooseClassForShubham(data);
      break;
    }

    case "Tejas": {
      console.log("Picking class for Tejas");
      classToBook = chooseClassForTejas(data);
      break;
    }

    default: {
      console.error("Invalid person picking class");
    }
  }

  return classToBook;
}
