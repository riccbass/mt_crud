import React, { useState, useEffect } from "react";
import Avatar from "react-avatar";

import MaterialTable from "material-table";
import TextField from "@material-ui/core/TextField";
import Autocomplete from "@material-ui/lab/Autocomplete";

import axios from "axios";
import AlertCtrl from "./AlertCtrl";

const api = axios.create({
  baseURL: `https://reqres.in/api`,
});

function validateEmail(email) {
  const re =
    /^((?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\]))$/;
  return re.test(String(email).toLowerCase());
}

const App = () => {
  var columns = [
    { title: "id", field: "id", hidden: true },
    {
      title: "Avatar",
      render: (rowData) => (
        <Avatar
          maxInitials={1}
          size={40}
          round={true}
          name={rowData === undefined ? " " : rowData.first_name}
        />
      ),
    },
    { title: "First name", field: "first_name" },
    { title: "Last name", field: "last_name" },
    {
      title: "Email",
      field: "email",
      editComponent: (props) => (
        // console.log(props)
        <Autocomplete
          id="autoComplete"
          freeSolo
          autoSelect
          value={props.value || ""}
          options={emailData}
          //   getOptionLabel={(option) => option.email || ""}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Email"
              variant="filled"
              inputProps={{
                ...params.inputProps,
                onKeyDown: (e) => {
                  if (e.key === "Enter") {
                    e.stopPropagation();
                  }
                },
              }}
            />
          )}
          // style={{ width: 270 }}
          onChange={(e) => {
            // const valorEdit = e.target.value;
            // props.onChange(e.target.value);
            if (e.target.value === 0) {
              props.onChange(e.target.innerText);
            } else {
              props.onChange(e.target.value);
            }
          }}
        />
      ),
    },
  ];
  const [data, setData] = useState([]); //table data
  const [emailData, setEmailData] = useState([]);

  //for error handling
  const [iserror, setIserror] = useState(false);
  const [errorMessages, setErrorMessages] = useState([]);

  useEffect(() => {
    api
      .get("/users")
      .then((res) => {
        setData(res.data.data);
        setEmailData(res.data.data.map((a) => a.email)); // se não deixar separado tá erro na hora do autocpmplete
      })
      .catch((error) => {
        console.log("Error");
      });
  }, []);

  const handleRowUpdate = (newData, oldData, resolve) => {
    //validation
    let errorList = [];
    if (newData.first_name === "") {
      errorList.push("Please enter first name");
    }
    if (newData.last_name === "") {
      errorList.push("Please enter last name");
    }
    if (newData.email === "" || validateEmail(newData.email) === false) {
      errorList.push("Please enter a valid email");
    }

    if (errorList.length < 1) {
      api
        .patch("/users/" + newData.id, newData)
        .then((res) => {
          const dataUpdate = [...data];
          const index = oldData.tableData.id;
          dataUpdate[index] = newData;
          setData([...dataUpdate]);
          resolve();
          setIserror(false);
          setErrorMessages([]);
        })
        .catch((error) => {
          setErrorMessages(["Update failed! Server error"]);
          setIserror(true);
          resolve();
        });
    } else {
      setErrorMessages(errorList);
      setIserror(true);
      resolve();
    }
  };

  const handleRowAdd = (newData, resolve) => {
    //validation
    let errorList = [];
    if (newData.first_name === undefined) {
      errorList.push("Please enter first name");
    }
    if (newData.last_name === undefined) {
      errorList.push("Please enter last name");
    }
    if (newData.email === undefined || validateEmail(newData.email) === false) {
      errorList.push("Please enter a valid email");
    }

    if (errorList.length < 1) {
      //no error
      api
        .post("/users", newData)
        .then((res) => {
          let dataToAdd = [...data];
          dataToAdd.push(newData);
          setData(dataToAdd);
          resolve();
          setErrorMessages([]);
          setIserror(false);
        })
        .catch((error) => {
          setErrorMessages(["Cannot add data. Server error!"]);
          setIserror(true);
          resolve();
        });
    } else {
      setErrorMessages(errorList);
      setIserror(true);
      resolve();
    }
  };

  const handleRowDelete = (oldData, resolve) => {
    api
      .delete("/users/" + oldData.id)
      .then((res) => {
        const dataDelete = [...data];
        const index = oldData.tableData.id;
        dataDelete.splice(index, 1);
        setData([...dataDelete]);
        resolve();
      })
      .catch((error) => {
        setErrorMessages(["Delete failed! Server error"]);
        setIserror(true);
        resolve();
      });
  };

  return (
    <div className="App">
      <h1>{emailData[0]}</h1>
      <div>{iserror && <AlertCtrl errorMessages={errorMessages} />}</div>
      <MaterialTable
        title="User"
        columns={columns}
        data={data}
        localization={{
          pagination: {
            firstAriaLabel: "Primeira página",
            lastAriaLabel: "Última página",
            firstTooltip: "Primeira página",
            lastTooltip: "Última página",
            nextAriaLabel: "Página seguinte",
            nextTooltip: "Página seguinte",
            previousAriaLabel: "Página anterior",
            previousTooltip: "Página anterior",
            labelRowsSelect: "Linhas",
          },
          header: {
            actions: "Ações",
          },
        }}
        options={{
          pageSizeOptions: [2, 5, 10, 20, 25, 500, 100],
          pageSize: 20,
        }}
        editable={{
          onRowUpdate: (newData, oldData) =>
            new Promise((resolve) => {
              handleRowUpdate(newData, oldData, resolve);
            }),
          onRowAdd: (newData) =>
            new Promise((resolve) => {
              handleRowAdd(newData, resolve);
            }),
          onRowDelete: (oldData) =>
            new Promise((resolve) => {
              handleRowDelete(oldData, resolve);
            }),
        }}
      />
    </div>
  );
};

export default App;
