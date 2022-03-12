import React from "react";
import Alert from "@material-ui/lab/Alert";

const AlertCtrl = ({ errorMessages }) => {
  return (
    <Alert severity="error">
      {errorMessages.map((msg, i) => {
        return <div key={i}>{msg}</div>;
      })}
    </Alert>
  );
};

export default AlertCtrl;
