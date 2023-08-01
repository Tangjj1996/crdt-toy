import ReactDOM from "react-dom/client";
import { ChakraProvider } from "@chakra-ui/react";
import App from "./app";

ReactDOM.createRoot(document.querySelector("#root")!).render(
  <ChakraProvider>
    <App />
  </ChakraProvider>,
);
