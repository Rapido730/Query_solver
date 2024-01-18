const fs = require("fs");

const csvFilePath = "Assignment_Timecard.xlsx - Sheet1.csv";

// Read the CSV file
const csvContent = fs.readFileSync(csvFilePath, "utf-8");

// Split the CSV content into rows
const rows = csvContent.split("\n");

// Assuming the first row contains the header
const header = rows[0].split(",");

// Rest of the rows contain data
const data = rows.slice(1).map((row) => row.split(","));

processedData = data.filter(
  (row) => !(row[2] === "" || row[3] === "" || row[4] === "")
); // removing row which are having some empty columns

// function for first query
// Employees who has worked for 7 consecutive days

const firstFilter = (data) => {
  let consecDays = 1; // counts consecutive days for current employee
  let currEmp = data[0][0]; // contains the position id of current employee
  const previousDate = new Date(Date.parse(data[0][2])); // contains previous date on which current employee have worked
  // default value stored according to first row of data

  let empSet = new Set(); // set to store query result

  for (let i = 1; i < data.length; i++) {
    const inDate = new Date(Date.parse(data[i][2])); // parsing intime
    if (data[i][0] == currEmp) {
      const nextDate = new Date(previousDate.toDateString()); // compute next date according to previous date
      nextDate.setDate(previousDate.getDate() + 1);

      if (inDate.toDateString() === nextDate.toDateString()) {
        // check if employee worked for next days also
        consecDays = consecDays + 1; // increment consecutive days
        previousDate.setDate(inDate.getDate());
        if (consecDays === 7) {
          // if consecutive days are equal to 7 store info
          empSet.add(
            JSON.stringify({
              Name: data[i][7] + data[i][8],
              Position_ID: currEmp,
            })
          );
        }
      } else if (inDate.toDateString() === previousDate.toDateString()) {
        // do nothing if he worked on same day in next shift
      } else {
        // if he skips days then reset day and modify previous date accordingly
        consecDays = 1;
        previousDate.setDate(inDate.getDate());
      }
    } else {
      // if current row contains different employee
      consecDays = 1;
      previousDate.setDate(inDate.getDate());
      currEmp = data[i][0];
    }
  }

  // return converted array from set
  return Array.from(empSet).map((str) => JSON.parse(str));
};
const firstResult = firstFilter(processedData);

// function for second query
// Employee who have less than 10 hours of time between shifts but greater than 1 hour

const secondFilter = (data) => {
  let currEmp = data[0][0]; // contains the position id of current employee
  let previousDate = new Date(Date.parse(data[0][3])); // contains previous out time at which current employee left work
  // default value stored according to first row of data

  let empSet = new Set(); // set to store result

  for (let i = 1; i < data.length; i++) {
    const inDate = new Date(Date.parse(data[i][2])); // get in and out time and date of employee
    const outDate = new Date(Date.parse(data[i][3]));

    if (data[i][0] == currEmp) {
      if (inDate.getDate() === previousDate.getDate()) {
        // both shift should be of same day

        const timeDiff = (inDate - previousDate) / (1000 * 60 * 60); // check for difference in hours
        if (timeDiff > 1 && timeDiff < 10) {
          empSet.add(
            JSON.stringify({
              Name: data[i][7] + data[i][8],
              Position_ID: currEmp,
            })
          );
        }
        previousDate = new Date(outDate.toUTCString());
      } else {
        previousDate = new Date(outDate.toUTCString());
      }
    } else {
      previousDate = new Date(outDate.toUTCString());
      currEmp = data[i][0];
    }
  }
  return Array.from(empSet).map((str) => JSON.parse(str));
};

const secondResult = secondFilter(processedData);

// Function for third query
// Employee Who has worked for more than 14 hours in a single shift

const thirdFilter = (data) => {
  const empSet = new Set(); // set to store result

  for (let i = 0; i < data.length; i++) {
    if (parseFloat(data[i][4]) > 14) {
      // check in Timecard hours column
      empSet.add(
        JSON.stringify({
          Name: data[i][7] + data[i][8],
          Position_ID: data[i][0],
        })
      );
    }
  }
  return Array.from(empSet).map((str) => JSON.parse(str));
};

const thirdResult = thirdFilter(processedData);

// Output file path
const outputFilePath = "output.txt";

// Function to reduce array to string in order to write in file
const reduceArrayToString = (arr) => {
  return (
    arr.reduce((str, emp, ind) => {
      str =
        str +
        (ind + 1) +
        ".  " +
        "Name : " +
        emp.Name +
        "        " +
        "Position : " +
        emp.Position_ID +
        "\n";
      return str;
    }, "") + "\n\n"
  );
};

let content = "";
content =
  content +
  "Employees who has worked for 7 consecutive days : \n" +
  reduceArrayToString(firstResult);
content =
  content +
  "Employees who have less than 10 hours of time between shifts but greater than 1 hour :\n" +
  reduceArrayToString(secondResult);
content =
  content +
  "Employees who has worked for more than 14 hours in a single shift : \n" +
  reduceArrayToString(thirdResult);

// Writing to the file
fs.writeFile(outputFilePath, content, (err) => {});
