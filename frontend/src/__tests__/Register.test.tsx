
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom'
// import '@testing-library/jest-dom/extend-expect'; // Import additional matchers
// import jest from "@jest/globals"
// import { mock, describe, test, beforeEach, expect } from '@jest/globals';
import {RegisterLogin} from '../pages';
import { BrowserRouter } from "react-router-dom";

// Mock the useNavigate hook from react-router-dom
jest.mock('react-router-dom', () => ({
      __esModule: true,
    ...jest.requireActual('react-router-dom'),
    useNavigate: () => jest.fn(),
}));

// Mock the fetch function globally
global.fetch = jest.fn();

var setup = () => {
    return render(
        <BrowserRouter>
            <RegisterLogin />
        </BrowserRouter>
    );
};

describe('RegisterLogin Component', () => {
    beforeEach(() => {
        (fetch as jest.Mock).mockClear();
    });

    test('it renders the Register form by default', () => {
        setup();
        // expect(screen.getByText(/Register/i)).toBeInTheDocument();
        expect(screen.getByRole('heading', { name: /Register/i })).toBeInTheDocument();
    });

    test('it allows the user to fill the form', () => {
        setup();
        fireEvent.change(screen.getByLabelText(/Email:/i), { target: { value: 'test@example.com' } });
        fireEvent.change(screen.getByLabelText(/Password:/i), { target: { value: 'password123' } });

        expect(screen.getByLabelText(/Email:/i)).toHaveValue('test@example.com');
        expect(screen.getByLabelText(/Password:/i)).toHaveValue('password123');
    });

    test('it displays a success message on successful registration', async () => {
        (fetch as jest.Mock).mockResolvedValueOnce({
            ok: true,
            json: async () => ({ message: 'User registered successfully' }),
        });

        setup();

        fireEvent.change(screen.getByLabelText(/Email:/i), { target: { value: 'test@example.com' } });
        fireEvent.change(screen.getByLabelText(/Password:/i), { target: { value: 'password123' } });
        fireEvent.click(screen.getByRole('button', { name: /Register/i }));

        await waitFor(() => {
            expect(screen.getByText(/Registration successful!/i)).toBeInTheDocument();
        });
    });

    test('it displays an error message on failed registration', async () => {
        (fetch as jest.Mock).mockResolvedValueOnce({
            ok: false,
            json: async () => ({ errorResponse: { errmsg: 'E11000: Duplicate key error' } }),
        });

        setup();

        fireEvent.change(screen.getByLabelText(/Email:/i), { target: { value: 'test@example.com' } });
        fireEvent.change(screen.getByLabelText(/Password:/i), { target: { value: 'password123' } });
        fireEvent.click(screen.getByRole('button', { name: /Register/i }));

        await waitFor(() => {
            expect(screen.getByText(/This email address is already associated with an account/i)).toBeInTheDocument();
        });
    });

    test('it switches to the Login form when user clicks the link', () => {
        setup();

        fireEvent.click(screen.getByText(/here/i));

        // expect(screen.getByText(/Login/i)).toBeInTheDocument();
        expect(screen.getByRole('heading', { name: /Login/i })).toBeInTheDocument();
    });

    test('it displays a success message on successful login', async () => {
        (fetch as jest.Mock).mockResolvedValueOnce({
            ok: true,
            json: async () => ({ message: 'Login successful' }),
        });

        setup();

        fireEvent.click(screen.getByText(/here/i)); // Switch to Login form

        fireEvent.change(screen.getByLabelText(/Email:/i), { target: { value: 'test@example.com' } });
        fireEvent.change(screen.getByLabelText(/Password:/i), { target: { value: 'password123' } });
        fireEvent.click(screen.getByRole('button', { name: /Login/i }));

        await waitFor(() => {
            expect(screen.getByText(/Login successful!/i)).toBeInTheDocument();
        });
    });
});