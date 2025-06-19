import React from "react";
import { createRoot } from "react-dom/client";
import { ChakraProvider } from "@chakra-ui/react";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { Web3Provider } from "./context/Web3Context";

const root = createRoot(document.getElementById("root"));
root.render(
  <BrowserRouter>
    <ChakraProvider>
      <Web3Provider>
        <App />
      </Web3Provider>
    </ChakraProvider>
  </BrowserRouter>
);