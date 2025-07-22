import { BrowserRouter, Routes, Route } from "react-router-dom";
// import { AuthProvider } from "./context/AuthProvider";
import PrivateRoute from "./components/PrivateRoute";
import { RegisterLogin, Home } from "./pages"
import './App.css'

function App() {

  // const apiUrl : string = process.env.VITE_API_URL!;
  // console.log(apiUrl);
  

  return (
    <BrowserRouter>
    <Routes>
      <Route index element={<RegisterLogin />}/>
      {/* <Route path="/login" element={<Login />}/> */}
      <Route element={<PrivateRoute/>}>
        <Route path="/home" element={<Home />} />
      </Route>
    </Routes>
   </BrowserRouter>  
  )
}

export default App
