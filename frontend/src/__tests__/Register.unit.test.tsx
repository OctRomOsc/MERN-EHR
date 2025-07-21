
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom'
import {RegisterLogin} from '../pages';
import { BrowserRouter } from "react-router-dom";
import { useState } from "react";

// Mock the useNavigate hook from react-router-dom
jest.mock('react-router-dom', () => ({
  __esModule: true,
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn(),
}));

// Mock the CloudFlare Turnstile
jest.mock('react-turnstile', () => ({
__esModule: true,
default: ({ onVerify }: any) => {
    const [label, setLabel] = useState('Verify that you are human');

    const handleClick = () => {
    setLabel('Verifying...');
    
    // Simulate async verification delay if desired
    // setTimeout(() => {
        onVerify('dummy-token');
        setLabel('Success!');
    // }, 5000);
    };

    return (
    <button
        data-testid="mock-turnstile"
        onClick={handleClick}
    >
        {label}
    </button>
    );
},
}));

// Mock the fetch function globally
global.fetch = jest.fn();

const setup = () => {
  return render(
    <BrowserRouter>
      <RegisterLogin />
    </BrowserRouter>
  );
};
beforeEach(() => {
    (fetch as jest.Mock).mockClear();
    jest.clearAllMocks();
    jest.resetAllMocks(); //This prevents previous mock fetch from leaking into subsequent tests - crucial!

    setup();
  });
describe('RegisterLogin Component', () => {
    describe('Rendering', () => {
        it('renders the Register form by default', () => {
        
            expect(screen.getByRole('heading', { name: /Register/i })).toBeInTheDocument();
        });
    });

    describe('Form interactions', () => {
        it('allows the user to fill the form', () => {
        
            fireEvent.change(screen.getByLabelText(/Email:/i), { target: { value: 'test@example.com' } });
            fireEvent.change(screen.getByLabelText(/Password:/i), { target: { value: 'password123' } });
            expect(screen.getByLabelText(/Email:/i)).toHaveValue('test@example.com');
            expect(screen.getByLabelText(/Password:/i)).toHaveValue('password123');
        });
    });

    describe('Registration success/error', () => {
        it('displays a success message on successful registration', async () => {
            (fetch as jest.Mock).mockResolvedValueOnce({
                ok: true,
                json: async () => ({ message: 'User registered successfully' }),
            });

            

            fireEvent.change(screen.getByLabelText(/Email:/i), { target: { value: 'test@example.com' } });
            fireEvent.change(screen.getByLabelText(/Password:/i), { target: { value: 'password123' } });
            fireEvent.click(screen.getByTestId('mock-turnstile'));
            await waitFor(() => {
                expect(screen.getByText(/Success!/i)).toBeInTheDocument();
            },);
            fireEvent.click(screen.getByRole('button', { name: /Register/i }));

            await waitFor(() => {
                expect(screen.getByText(/Registration successful!/i)).toBeInTheDocument();
            });
        });

        it('displays an error message on failed registration', async () => {
            (fetch as jest.Mock).mockResolvedValueOnce({
                ok: false,
                json: async () => ({ errorResponse: { errmsg: 'E11000: Duplicate key error' } }),
            });

            

            fireEvent.change(screen.getByLabelText(/Email:/i), { target: { value: 'test@example.com' } });
            fireEvent.change(screen.getByLabelText(/Password:/i), { target: { value: 'password123' } });
            fireEvent.click(screen.getByTestId('mock-turnstile'));
            await waitFor(() => {
                expect(screen.getByText(/Success!/i)).toBeInTheDocument();
            });
            fireEvent.click(screen.getByRole('button', { name: /Register/i }));

            await waitFor(() => {
                expect(screen.getByText(/This email address is already associated with an account/i)).toBeInTheDocument();
            });
        });

        it('displays a prompt to complete CloudFlare Turnstile verification', async () => {
            
            
    
            fireEvent.change(screen.getByLabelText(/Email:/i), { target: { value: 'test@example.com' } });
            fireEvent.change(screen.getByLabelText(/Password:/i), { target: { value: 'password123' } });
            fireEvent.click(screen.getByRole('button', { name: /Register/i }));
    
            await waitFor(() => {
            expect(screen.getByText(/Please confirm that you are human./i)).toBeInTheDocument();
            });
        });
    });

    describe('Switching forms', () => {
        it('switches to the Login form when user clicks the link', () => {
        
            fireEvent.click(screen.getByText(/here/i));
            expect(screen.getByRole('heading', { name: /Login/i })).toBeInTheDocument();
        });
    });

    describe('Login success/error', () => {
        it('displays a success message on successful login', async () => {
            (fetch as jest.Mock).mockResolvedValueOnce({
                ok: true,
                json: async () => ({ message: 'Login successful' }),
            });
        
            
    
            fireEvent.click(screen.getByText(/here/i)); // Switch to Login form
            expect(screen.getByRole('heading', { name: /Login/i })).toBeInTheDocument();
    
            fireEvent.change(screen.getByLabelText(/Email:/i), { target: { value: 'test@example.com' } });
            fireEvent.change(screen.getByLabelText(/Password:/i), { target: { value: 'password123' } });
            fireEvent.click(screen.getByTestId('mock-turnstile'));
            await waitFor(() => {
                expect(screen.getByText(/Success!/i)).toBeInTheDocument();
            });
            fireEvent.click(screen.getByRole('button', { name: /Login/i }));
    
            await waitFor(() => {
            expect(screen.getByText(/Login successful!/i)).toBeInTheDocument();
            });
        });

        it('displays a failure message on unsuccessful login', async () => {
            (fetch as jest.Mock).mockResolvedValueOnce({
                ok: false,
                status: 401,
                json: async () => ({ message: 'Invalid credentials' }),
            });

            

            fireEvent.click(screen.getByText(/here/i)); // Switch to Login form
            expect(screen.getByRole('heading', { name: /Login/i })).toBeInTheDocument();

            fireEvent.change(screen.getByLabelText(/Email:/i), { target: { value: 'test@example.com' } });
            fireEvent.change(screen.getByLabelText(/Password:/i), { target: { value: 'password111' } });
            fireEvent.click(screen.getByTestId('mock-turnstile'));
            await waitFor(() => {
                expect(screen.getByText(/Success!/i)).toBeInTheDocument();
            });
            
            fireEvent.click(screen.getByRole('button', { name: /Login/i }));

            await waitFor(() => {
                expect(screen.getByText(/Invalid credentials/i)).toBeInTheDocument();
            });
        
        });
    

        it('displays a prompt to complete CloudFlare Turnstile verification', async () => {

            fireEvent.click(screen.getByText(/here/i)); // Switch to Login form
            expect(screen.getByRole('heading', { name: /Login/i })).toBeInTheDocument();

            fireEvent.change(screen.getByLabelText(/Email:/i), { target: { value: 'test@example.com' } });
            fireEvent.change(screen.getByLabelText(/Password:/i), { target: { value: 'password123' } });
            fireEvent.click(screen.getByRole('button', { name: /Login/i }));


            await waitFor(() => {
                expect(screen.getByText(/Please confirm that you are human./i)).toBeInTheDocument();
            });
        });
    });
});