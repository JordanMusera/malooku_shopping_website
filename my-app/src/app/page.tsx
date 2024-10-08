import HomeProducts from "./components/HomeProducts";
import HomeTopBar from "./components/HomeTopBar";
import Topbar from "./components/Topbar";

export default function Home() {
  return (
    <div className="h-screen relative overflow-auto">
      <div className="sticky top-0 z-10 shadow-xl">
        <Topbar/>
      </div>
      <div className="w-full p-3 h-1/3 mb-3">
        <HomeTopBar/>
      </div>
      
      
      <div className="overflow-auto">
        <HomeProducts/>
      </div>
      
    </div>
  );
}
