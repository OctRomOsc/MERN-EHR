import {useState} from 'react';
import {NavigateFunction, useNavigate} from 'react-router-dom';
import validator from 'validator';
// import '../index.css';

interface accountCred {
  email:string;
  password:string;
};

const RegisterLogin = () => {
    var [userInput, setUserInput] = useState<accountCred>({email: '', password: ''});
    const [loginPage, setLoginPage] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>('');
    const [success, setSuccess] = useState<string>('');
    const navigate : NavigateFunction = useNavigate(); // Get the navigate function

    const apiUrl : string = process.env.VITE_API_URL!; // Default for local dev
    console.log(apiUrl);

    const validateUserInput = async (password : string) => {
      if (typeof password !== 'string') {
          return false; // or throw an error
      }
  
      const sanitizedInput = validator.escape(password);
  
      if (sanitizedInput.includes('=')) {
          return false; // or throw an error
      }
  
      return true;
      }
  
    
    const handleFormChange = async (event : any) => {
      

      // Prepare user data
      setUserInput({
        ...userInput,
        [event.target.name]: event.target.value,
      });
      console.log(userInput);
      validator.isEmail(userInput.email)
      if (!validateUserInput(userInput.password)){

      }
      
    }

    const handleRegister = async (event : any) => {
      event.preventDefault(); // Prevent the default form submission
      setLoading(true)
        try{
            const response : Response = await fetch(`${apiUrl}/register` , {
              method: "POST",
              headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
              },
              body: JSON.stringify(userInput),
            })
    
            // let result : Object = await response.text()
            // console.log(result);
            // setData(result);



            // Check if the response is okay (status code 200-299)
            if (!response.ok) {
              const errorData : any = await response.json(); // Get error data if any
              const errorDataMessage : string = errorData.errorResponse.errmsg
              let message : string = "";
              if (errorDataMessage.includes("E11000")) {
                 message = "This email address is already associated with an account. Please enter a different email."
              }
              console.log(errorData);
              throw new Error(message || 'Something went wrong!');
          }

          // Handle successful registration
          setLoading(false)
          const data  = await response.json();
          setSuccess('Registration successful!');
          console.log(data); // Handle the successful response as needed

          // Reset the form
          setUserInput({ email: '', password: '' });
          setError(''); // Clear any errors on successful registration

          setLoginPage(!loginPage);
            
        }
        catch (err: any){
          setLoading(false)
          setError(err.message); // Set error message
          console.error('Error:', err);
        }
      }

      const handleLogin = async (event : any) => {
        event.preventDefault(); // Prevent the default form submission
        setLoading(true)
          try{
              const response : Response = await fetch(`${apiUrl}/Login` , {
                method: "POST",
                headers: {
                  Accept: "application/json",
                  "Content-Type": "application/json",
                },
                body: JSON.stringify(userInput),
              })
      
              // let result : Object = await response.text()
              // console.log(result);
              // setData(result);
  
  
  
              // Check if the response is okay (status code 200-299)
              if (!response.ok) {
                const errorData : any = await response.json(); // Get error data if any
                throw new Error(errorData.message || 'Something went wrong!');
            }
  
            // Handle successful registration
            setLoading(false)
            const data : string = await response.json();
            setSuccess('Login successful!');
            console.log(data); // Handle the successful response as needed
  
          //   localStorage.setItem('jwtToken', data.token);
  
            // Reset the form
            setUserInput({ email: '', password: '' });
            setError(''); // Clear any errors on successful registration
  
            navigate('/home'); // Redirect to home
              
          }
          catch (err: any){
            setLoading(false)
            setError(err.message); // Set error message
            console.error('Error:', err);
          }
        }
  
  
      return (
        <>
        {!loginPage ?
            (<form onSubmit={handleRegister} className="space-y-4">
                <h1 className="text-lg font-bold">Register</h1>
                {error && <p className="text-red-500">{error}</p>}
                {success && <p className="text-green-500">{success}</p>}
                
                <fieldset className="space-y-2">
                    <legend className="sr-only">Registration details</legend>
    
                    <div className="flex flex-col space-y-2">
                        <label htmlFor="email" className="text-sm font-medium">Email:</label>
                        <input
                            type="email"
                            name="email"
                            id="email" // Correctly labeled for accessibility
                            value={userInput.email}
                            onChange={handleFormChange}
                            placeholder="example@email.com"
                            required
                            className={`border border-gray-300 rounded py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500
                            ${!userInput.email ? 'text-[#808080]' : 'text-black'}`}
                        />
                    </div>
    
                    <div className="flex flex-col space-y-2">
                        <label htmlFor="password" className="text-sm font-medium">Password:</label>
                        <input
                            type="password"
                            name="password"
                            id="password" // Correctly labeled for accessibility
                            value={userInput.password}
                            onChange={handleFormChange}
                            required
                            className="border border-gray-300 rounded py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                </fieldset>
    
                {/* Ensure the button is also a direct child of the form */}
                <button type="submit" className={`w-full bg-blue-500  py-2 rounded hover:bg-blue-600
                ${
                  (!userInput.email || !userInput.password || userInput.email === "example@email.com" || loading) 
                  ? "bg-gray-400 text-gray-200 cursor-not-allowed" 
                  : "bg-yellow text-black cursor-pointer focus:outline"
              }   `}>
                    Register
                </button>

                <p>Already a registered user? Login <a onClick={() => {setLoginPage(!loginPage);setUserInput({ email: '', password: '' });console.log(loginPage);}} className="hover:underline text-blue-600 font-bold cursor-pointer">
                  here</a></p>
            </form>) : (<form onSubmit={handleLogin} className="space-y-4">
                <h1 className="text-lg font-bold">Login</h1>
                {error && <p className="text-red-500">{error}</p>}
                {success && <p className="text-green-500">{success}</p>}
                
                <fieldset className="space-y-2">
                    <legend className="sr-only">Login details</legend>
    
                    <div className="flex flex-col space-y-2">
                        <label htmlFor="email" className="text-sm font-medium">Email:</label>
                        <input
                            type="email"
                            name="email"
                            id="email" // Correctly labeled for accessibility
                            value={userInput.email}
                            onChange={handleFormChange}
                            placeholder="example@email.com"
                            required
                            className={`border border-gray-300 rounded py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500
                            ${!userInput.email ? 'text-gray-200' : 'text-black'}`}
                        />
                    </div>
    
                    <div className="flex flex-col space-y-2">
                        <label htmlFor="password" className="text-sm font-medium">Password:</label>
                        <input
                            type="password"
                            name="password"
                            id="password" // Correctly labeled for accessibility
                            value={userInput.password}
                            onChange={handleFormChange}
                            required
                            className="border border-gray-300 rounded py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                </fieldset>
    
                {/* Ensure the button is also a direct child of the form */}
                <button type="submit" className={`w-full bg-blue-500  py-2 rounded hover:bg-blue-600 
                ${
                  (!userInput.email || !userInput.password || userInput.email === "example@email.com" || loading) 
                  ? "bg-gray-400 text-gray-200 cursor-not-allowed" 
                  : "bg-yellow text-black cursor-pointer "
              }   `}>
                    Login
                </button>

                <p>Don't have an account? Register <a onClick={() => {setLoginPage(!loginPage);setUserInput({ email: '', password: '' });console.log(loginPage);}} className="hover:underline text-blue-600 font-bold cursor-pointer">
                  here</a></p>
            </form>)}
        </>
    );
}

export default RegisterLogin;