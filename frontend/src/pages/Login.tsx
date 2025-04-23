import {useState} from 'react';
import {useNavigate} from 'react-router-dom';
import validator from 'validator';
import '../App.css';

interface accountCred {
  email:string;
  password:string;
};

function Login() {
    var [userInput, setUserInput] = useState<accountCred>({email: '', password: ''});
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const navigate = useNavigate(); // Get the navigate function

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

// ... (rest of the example code)
    
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

    const handleLogin = async (event : any) => {
      event.preventDefault(); // Prevent the default form submission
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
          const data : string = await response.text();
          setSuccess('Login successful!');
          console.log(data); // Handle the successful response as needed

        //   localStorage.setItem('jwtToken', data.token);

          // Reset the form
          setUserInput({ email: '', password: '' });
          setError(''); // Clear any errors on successful registration

          navigate('/home'); // Redirect to home
            
        }
        catch (err: any){
          setError(err.message); // Set error message
          console.error('Error:', err);
        }
      }
  
  
    return (
      <>
        <form onSubmit={handleLogin} className="flex">
            <h1>Login</h1>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            {success && <p style={{ color: 'green' }}>{success}</p>}
            <div>
                <label>
                    Email:
                    <input
                        type="email"
                        name="email" // Name attribute for state management
                        value={userInput.email}
                        onChange={handleFormChange}
                        required
                    />
                </label>
            </div>
            <div>
                <label>
                    Password:
                    <input
                        type="password"
                        name="password" // Name attribute for state management
                        value={userInput.password}
                        onChange={handleFormChange}
                        required
                    />
                </label>
            </div>
            <button type="submit">Login</button>
        </form>
        
      </>
    )
}

export default Login;