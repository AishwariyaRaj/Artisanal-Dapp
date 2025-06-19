import React from "react";
import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Marketplace from "./pages/Marketplace";
import Mint from "./pages/Mint";
import NFTDetails from "./pages/NFTDetails";

export default function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/marketplace" element={<Marketplace />} />
        <Route path="/mint" element={<Mint />} />
        <Route path="/nft/:id" element={<NFTDetails />} />
      </Routes>
    </>
  );
}