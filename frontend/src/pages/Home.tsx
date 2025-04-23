import {useState, useEffect} from 'react';
import reactLogo from '../assets/react.svg'
import viteLogo from '/vite.svg'
import '../App.css'

function Home() {
    // const [data, setData] = useState<Array<object>>([]);
    const [data, setData] = useState<string>("");
    const apiUrl : string = process.env.VITE_API_URL!; // Default for local dev
    console.log(apiUrl);
    
  
    const getTest = async () => {
      try{
          const response : Response = await fetch(`${apiUrl}/test` , {
            method: "GET",
            
          })
  
          // let result : Array<object> = await response.json()
          let result : string = await response.text()
          console.log(result);
          setData(result);
          
      }
      catch (err){
  
      }
    }

  
    useEffect(() => {
      getTest(); // Fetch data when component mounts
    }, []);
  
    return (
      <>
        <div>
          <a href="https://vite.dev" target="_blank">
            <img src={viteLogo} className="logo" alt="Vite logo" />
          </a>
          <a href="https://react.dev" target="_blank">
            <img src={reactLogo} className="logo react" alt="React logo" />
          </a>
        </div>
        <h1>Vite + React</h1>
        
        <p className="read-the-docs">
          Click on the Vite and React logos to learn more
        </p>
        <div className='text-black'>{data}</div>
      </>
    )
}

export default Home;