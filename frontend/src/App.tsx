// import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Register, Login, Home } from "./pages"
// import reactLogo from './assets/react.svg'
// import viteLogo from '/vite.svg'
import './App.css'

function App() {
  // const [count, setCount] = useState<number>(0)
  // const [data, setData] = useState<string>()

  const apiUrl : string = process.env.VITE_API_URL!; // Default for local dev
  console.log(apiUrl);
  

  return (
    <BrowserRouter>
    <Routes>
      <Route index element={<Register />}/>
      <Route path="/login" element={<Login />}/>
      <Route path="/home" element={<Home />} />
    </Routes>
   </BrowserRouter>  
  )
}

export default App
