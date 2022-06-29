import React from "react";
import ReactDOM from "react-dom";
import Application from "./Application";
import reportWebVital from "./reportWebVital";

import { store } from "./ApplicationStore";

import "./index.css";
import { Provider } from "react-redux";

ReactDOM.render(
    (
        <React.StrictMode>
            <Provider store={store}>
            <Application boardRows={5} boardColumns={5}/>
            </Provider>
        </React.StrictMode>
    ), document.getElementById("root")
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVital();
