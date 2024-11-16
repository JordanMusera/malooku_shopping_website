'use client'
import { useEffect, useState } from "react";
import HomeProducts from "./components/HomeProducts";
import HomeTopBar from "./components/HomeTopBar";
import Topbar from "./components/Topbar";
import Footer from "./components/Footer";

export default function Home() {
  return (
    <div className="h-screen relative overflow-auto">
      <div className="sticky top-0 z-10 shadow-xl">
        <Topbar/>
      </div>
      <div className="w-full p-3 xl:h-1/3 h-1/4 mb-3 md:px-10">
        <HomeTopBar/>
      </div>
    
      <div className="overflow-auto md:px-10 min-h-screen">
        <HomeProducts/>
      </div>

      <div>
        <Footer/>
      </div>
      
    </div>
  );
}
