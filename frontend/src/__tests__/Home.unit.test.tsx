import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom'
import {Home} from '../pages';
import { AuthProvider } from '../context/AuthProvider';
import { BrowserRouter } from "react-router-dom";


// Mock fetch globally
global.fetch = jest.fn();

// Setup
const renderWithProviders = () => {
  return render(
    <AuthProvider>
      <BrowserRouter>
        <Home />
      </BrowserRouter>
    </AuthProvider>
  );
};

//Mock dummy patient data
beforeEach(() => {
    (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          address: {
            line: ['123 Main St'],
            city: 'Sample City',
            stateOrProvince: 'State',
            country: 'Country',
            postalCode: '12345'
          },
          name: ['John Doe'],
          gender: 'male',
          birthDate: new Date('1990-01-01'),
          telecom: ['555-1234', 'john@example.com'],
          healthConditions: [{ condition: 'Diabetes' }],
          medications: [{ medicationCode: 'Med123', dosage: '10mg' }],
          contacts: [{ name: 'Jane', relationship: 'Spouse', telecom: '555-5678' }]
        }),
      } as Response);
    renderWithProviders()
})

describe('Home Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
  });

  describe('Rendering and Data Fetching', () => {
    it('renders without crashing and fetches data', async () => {

      // Wait for data to load
      await waitFor(() => {
        expect(screen.getByDisplayValue(/123 Main St/i)).toBeInTheDocument();
      }, { timeout: 10000 });
    });
  });

  describe('Editing and Saving', () => {
    it('allows editing, saving, and resetting data', async () => {

      // Wait for data to load
      await waitFor(() => {
        expect(screen.getByDisplayValue(/123 Main St/i)).toBeInTheDocument();
      }, { timeout: 10000 });

      // Enter edit mode
      fireEvent.click(screen.getByRole('button', {name: /Edit/i}));
      expect(screen.getByRole('button', {name: /Save/i})).toBeInTheDocument();

      // Make a change
      const addressInput = screen.getByDisplayValue(/123 Main St/i) as any;
      fireEvent.change(addressInput, { target: { value: '456 Elm St' } });
      expect(addressInput.value).toBe('456 Elm St');

      // Reset changes
      const resetBtn = screen.getByRole('button', {name: /Reset/i});
      fireEvent.click(resetBtn);
      // Confirm the address reset (or initial value)
      expect(screen.getByDisplayValue(/123 Main St/i)).toBeInTheDocument();

      // Re-enter edit mode
      fireEvent.click(screen.getByRole('button', {name: /Edit/i}));
      expect(screen.getByRole('button', {name: /Save/i})).toBeInTheDocument();

      // Make a change again
      fireEvent.change(addressInput, { target: { value: '456 Elm St' } });
      expect(addressInput.value).toBe('456 Elm St');

      // Save changes
      fireEvent.click(screen.getByRole('button', {name: /Save/i}));
      await waitFor(() => {
        // expect(screen.queryByRole('button', {name: /Save/i})).not.toBeInTheDocument();
        expect(screen.getByRole('button', {name: /Edit/i})).toBeInTheDocument()
      })
      

      // Confirm the address reset (or initial value)
      expect(screen.getByDisplayValue(/456 Elm St/i)).toBeInTheDocument();
    });
  });

  describe('Logout', () => {
    it('handles logout correctly', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ message: 'Logged out' }),
      } as Response);

      const logoutBtn = screen.getByRole('button',{name:/Logout/i});
      fireEvent.click(logoutBtn);

      await waitFor(() => {
        expect(fetch).toHaveBeenCalledWith(expect.stringContaining('/api/logout'), expect.any(Object));
      }, { timeout: 10000 });
    });
  });
});