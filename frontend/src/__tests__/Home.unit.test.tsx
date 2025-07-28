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

beforeEach(async () => {
  jest.clearAllMocks();
  jest.resetAllMocks();
  (fetch as jest.Mock).mockImplementation((url) => {
    if (typeof url === 'string') {
      if (url.includes('/api/verify')) {
        return Promise.resolve({ok:true, status: 200, json: async ()=> ({}) } as Response);
      }
      if (url.includes('/api/dashboard')) {
        return Promise.resolve({
          ok: true,
          status: 200,
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
      }
    }
    
    // Default fallback
    return Promise.resolve({ status: 404, json: async () => ({ message: 'Not found' }) } as Response) ;
  });
  renderWithProviders()

  await waitFor(() => {
    expect(screen.queryByText('Contact Information')).toBeInTheDocument();
  });
});

describe('Home Component', () => {

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
      // Confirm the address reset (initial value)
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