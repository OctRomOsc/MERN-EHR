import { BrowserRouter, Routes, Route } from "react-router-dom";
import {PrivateRoute, Footer} from "./components";
import { RegisterLogin, Home } from "./pages"
import './App.css'

function App() {

  return (
    <BrowserRouter>
    <Routes>
      <Route index element={<RegisterLogin />}/>
      <Route element={<PrivateRoute/>}>
        <Route path="/home" element={<Home />} />
      </Route>
    </Routes>
    <Footer/>
   </BrowserRouter>  
  )
}

export default App
