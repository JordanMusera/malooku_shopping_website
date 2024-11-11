'use client'
import { useEffect, useState } from "react";
import HomeProducts from "./components/HomeProducts";
import HomeTopBar from "./components/HomeTopBar";
import Topbar from "./components/Topbar";

export default function Home() {
  const[userItem,setUserItem] = useState({});

  useEffect(()=>{
    const fetchUser=async()=>{
      const res = await fetch('/api/users');
      const response = await res.json();

      if(response.success){
        setUserItem(response.user);
        console.log(response.user);
      }
    }

    fetchUser();
  },[])
  return (
    <div className="h-screen relative overflow-auto md:px-10">
      <div className="sticky top-0 z-10 shadow-xl">
        <Topbar/>
      </div>
      <div className="w-full p-3 xl:h-1/3 h-1/4 mb-3">
        <HomeTopBar/>
      </div>
      
      
      <div className="overflow-auto">
        <HomeProducts/>
      </div>
      
    </div>
  );
}
