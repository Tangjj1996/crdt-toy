import React from "react";
import ReactDOM from "react-dom/client";
import { ChakraBaseProvider } from "@chakra-ui/react";
import App from "./app";

ReactDOM.createRoot(document.querySelector("#root")!).render(
  <React.StrictMode>
    <ChakraBaseProvider>
      <App />
    </ChakraBaseProvider>
  </React.StrictMode>,
);
