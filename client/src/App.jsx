import { Routes, Route } from "react-router-dom";
import { useEffect, useState } from "react";
import { medusaClient } from "./utils/client";
import './App.css'
import RegionSelector from "./components/RegionSelector";
import NavHeader from './components/NavHeader'
import Home from './routes/Home'
import Product from './routes/Product'

function App() {

  const [regionid, setRegionid] = useState(localStorage.getItem('region'));
  const [regionObj, setRegionObj] = useState({});

  useEffect(() => {
    const getRegions = async() => {
      const regions = await medusaClient.store.region.retrieve(regionid);
      setRegionObj(regions);
    }
    if(regionid){
      getRegions();
    }

  }, []);

  useEffect(() => {
    const getRegions = async() => {
      const regions = await medusaClient.store.region.retrieve(regionid);
      setRegionObj(regions);
    }
    if(regionid){
      getRegions();
    }
  }, [regionid])

  const onRegionSelect = (regionSelected) => {
    console.log(regionSelected);
    setRegionid(regionSelected);
    localStorage.setItem('region', regionSelected);
  }
  
  return (
    <div className="App">
      {!regionid && <RegionSelector onRegionSelect={onRegionSelect} /> }
      <NavHeader regionid={regionid} onRegionSelect={onRegionSelect} />
      <Routes>
        <Route path="/" element={<Home regionid={regionid} onRegionSelect={onRegionSelect} />} />
        <Route path="products/:id" element={<Product regionid={regionid} onRegionSelect={onRegionSelect} />} />
      </Routes>
    </div>
  )
}

export default App