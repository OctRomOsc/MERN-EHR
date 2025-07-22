import {useState, useContext, useEffect} from 'react';
import {NavigateFunction, useNavigate} from 'react-router-dom';
import { AuthContext } from '../context/AuthProvider.tsx'
import Turnstile from 'react-turnstile';
import validator from 'validator';

interface accountCred {
  email:string;
  password:string;
};

const RegisterLogin = () => {
    const authContext = useContext(AuthContext);

    useEffect(() => {
      console.log('Auth state changed:', authContext?.isAuthenticated);
    }, [authContext?.isAuthenticated]);

    const [userInput, setUserInput] = useState<accountCred>({email: '', password: ''});
    const [loginPage, setLoginPage] = useState<boolean>(false);
    const [turnstileToken, setTurnstileToken] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>('');
    const [success, setSuccess] = useState<string>('');
    const navigate : NavigateFunction = useNavigate(); // Get the navigate function

    let apiUrl : string = process.env.VITE_API_URL!; // Default for local dev
    const port : string = process.env.PORT!;
    const mode : string = process.env.NODE_ENV!;
    if (mode!=="production"){
      apiUrl+=port
    }
    const cloudflare : string = process.env.TURNSTILE_SITE_KEY!;
    
    

    const validatePassword = async (password : string) => {
      if (typeof password !== 'string') {
          setError("Password must be alphanumeric string")
          return false; // or throw an error
      }

      
  
      if (password.includes('=')) {
        setError("Password cannot contain '='"); // or throw an error
      }
      else {
      setError('');
      }

      const sanitizedInput = validator.escape(password);
      
      
      return sanitizedInput;
      }
  
    
    const handleFormChange = async (event : React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      

      // Prepare user data
      setUserInput({
        ...userInput,
        [event.target.name]: event.target.value,
      });
      
      if(validator.isEmail(event.target.value)){ //checks if current inputted value is email; to check previous value replace with userInput.email
        
        setError("")
        
      }
      else if (!event.target.value) {
        setError("")
      }
      else {
        setError(`Please enter a valid email address, e.g. "email@example.com`)
        
      }
      if (event.target.name === 'password') {
      validatePassword(userInput.password)
      }
      if (success){
        setSuccess('')
      }
      
    }

    const handleTurnstileVerify = (token : string) => {
      setTurnstileToken(token);
    
      if (error === 'Please confirm that you are human.'){
        setError('')
        
      }
    };

    const handleRegister = async (event : any) => {
      event.preventDefault(); // Prevent the default form submission
      if (!turnstileToken) {
        // alert('Please complete the Turnstile verification.');
        setError('Please confirm that you are human.')
        return;
      }
      setLoading(true)
        try{
            const response : Response = await fetch(`${apiUrl}/api/register` , {
              method: "POST",
              headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
              },
              body: JSON.stringify({...userInput, 'cf-turnstile-response': turnstileToken}),
            })
    
            

            const data  = await response.json();


            // Check if the response is okay (status code 200-299)
            if (!response.ok) {
               // Get error data if any
              const errorDataMessage : string = data.errorResponse.errmsg
              let message : string = "";
              if (errorDataMessage.includes("E11000")) {
                 message = "This email address is already associated with an account. Please enter a different email."
              }
              else {
                message = errorDataMessage;
              }
              
              // setError(data.message || 'Something went wrong! Please refresh the page.')
              console.log(data);
              throw new Error(message || 'Something went wrong! Please refresh the page.');
          }

            // Handle successful registration
            setLoading(false)
            
            setSuccess('Registration successful!');
            

            // Reset the form
            setUserInput({ email: '', password: '' });
            setError(''); // Clear any errors on successful registration

            
            
            setLoginPage(!loginPage);
            
            
              
        }
        catch (err: any){
          setLoading(false)
          setError(err.message); // Set error message
          console.error(err);
        }
      }

      const handleLogin = async (event : any) => {
        event.preventDefault(); // Prevent the default form submission
        if (!turnstileToken) {
          // alert('Please complete the Turnstile verification.');
          setError('Please confirm that you are human.')
          return;
        }
        setLoading(true)
          try{
              const response : Response = await fetch(`${apiUrl}/api/login` , {
                method: "POST",
                headers: {
                  Accept: "application/json",
                  "Content-Type": "application/json",
                },
                credentials: 'include', // <-- important to include cookies
                body: JSON.stringify({...userInput, 'cf-turnstile-response': turnstileToken}),
              })
      
              
  
              
              const data : Response | any = await response.json();
              // Check if the response is okay (status code 200-299)
              
              
              if (!response.ok) {
                // setError(data.message || 'Something went wrong! Please refresh the page.')
                console.log(data);
                
                throw new Error(data.message || 'Something went wrong! Please refresh the page.');
            }
            
              // Handle successful login
              setLoading(false)
              setSuccess('Login successful!');
              
    
              // localStorage.setItem('jwtToken', data.token);
              authContext?.login();
              authContext?.setUser(userInput.email);
              
              
              
    
              // Reset the form
              setUserInput({ email: '', password: '' });
              setError(''); // Clear any errors on successful login
              navigate('/home'); // Redirect to home
              
          }
          catch (err: any){
            setLoading(false)
            setError(err.message); // Set error message
            console.error(err);
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

                <Turnstile
                  sitekey={cloudflare} // Replace with your actual Site Key
                  onVerify={handleTurnstileVerify}
                />
                {/* <Turnstile
                  siteKey={cloudflare} // @marsidev/react-turnstile library
                  onSuccess={handleTurnstileVerify}
                  // scriptOptions={{nonce:""}}
                /> */}
    
                {/* Ensure the button is also a direct child of the form */}
                <button type="submit" className={`w-full bg-blue-500  py-2 rounded hover:bg-blue-600
                ${
                  (!userInput.email || !userInput.password || userInput.email === "example@email.com" || !turnstileToken || loading) 
                  ? "bg-gray-400 text-gray-200 cursor-not-allowed" 
                  : "bg-yellow text-black cursor-pointer focus:outline"
              }   `}
              disabled={loading || !!success}
              >
                    Register
                </button>

                <p>Already a registered user? Login <a onClick={() => {setLoginPage(!loginPage);setUserInput({ email: '', password: '' });}} className="hover:underline text-blue-600 font-bold cursor-pointer">
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

                <Turnstile
                  sitekey = {cloudflare} // Replace with your actual Site Key
                  onVerify = {handleTurnstileVerify}
                />

                {/* <Turnstile
                  siteKey={cloudflare} // @marsidev/react-turnstile library
                  onSuccess={handleTurnstileVerify}
                  // scriptOptions={{nonce:""}}
                /> */}
    
                {/* Ensure the button is also a direct child of the form */}
                <button type="submit" className={`w-full bg-blue-500  py-2 rounded hover:bg-blue-600 
                ${
                  (!userInput.email || !userInput.password || userInput.email === "example@email.com" || !turnstileToken || loading) 
                  ? "bg-gray-400 text-gray-200 cursor-not-allowed" 
                  : "bg-yellow text-black cursor-pointer "
              }   `}
              disabled={loading || !!success}
              >
                    Login
                </button>

                <p>Don't have an account? Register <a onClick={() => {setLoginPage(!loginPage);setUserInput({ email: '', password: '' });}} className="hover:underline text-blue-600 font-bold cursor-pointer">
                  here</a></p>
            </form>)}
        </>
    );
}

export default RegisterLogin;