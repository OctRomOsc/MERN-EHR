// import { describe, it, expect } from '@jest/globals';
import request from 'supertest';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import  {server}  from '../server'; // Import your app
import {User, Patient, IPatient} from '../models';
import jwt from 'jsonwebtoken';

dotenv.config({ path: path.resolve(process.cwd(), '../.env') });
const port: number | string = process.env.TEST_PORT || 3001;

beforeEach(() => {
  jest.clearAllMocks();
  jest.resetAllMocks();
});

describe('Server Routes', () => {
    beforeAll(async () => {
      console.log('Setting up before all tests...');
      try {

        // Clear database before test
        await User.deleteMany({}); // Clear the User collection
        await Patient.deleteMany({}); // Clear the Patient collection

      } catch (error) {
        console.error("Error during setup:", error);
        // This is crucial: if connection fails, the rest of the tests won't run.
        await mongoose.connection.close();
        throw error; // Re-throw to stop the test suite
      }

    });
    afterAll( (close) => {
      console.log('Cleaning up after all tests...');
      try {
        // Properly close the server, releasing resources
        server.close(close);

        
        // Properly close the database connection
        mongoose.connection.close();
        console.log('Closed the database connection.');
        
      } catch (error) {
        console.error('Error during teardown:', error);
      }
    });

    describe('POST /api/register', () => {
      console.log('Running Test Suite: POST /api/register');
      it('should create and register new user', async () => {
        jest.spyOn(require('../server'), 'verifyTurnstileToken').mockResolvedValue(true);
        const email = "testuser1@test.ca"
        const password = "testpassword1"
        const response = await request(server)
          .post('/api/register')
          .send({
            email: email,
            password: password,
            'cf-turnstile-response': 'dummy-turnstile-token',
          });
        
        
        expect(response.statusCode).toBeGreaterThanOrEqual(201);
        expect(response.body.message).toBe("User registered");
        
        
      });
    
      it('should not allow you to create and register a new user with taken email', async () => {
        jest.spyOn(require('../server'), 'verifyTurnstileToken').mockResolvedValue(true);
        const email = "testuser1@test.ca"
        const password = "testpassword1"
        const response = await request(server)
          .post('/api/register')
          .send({
            email: email,
            password: password,
            'cf-turnstile-response': 'dummy-turnstile-token',
          });
        
        expect(response.statusCode).toBe(400);
        expect(response.body.error).toEqual(expect.stringContaining("E11000"));
        
      });
    })
    
    describe('POST /api/login', () => {
      console.log('Running Test Suite: POST /api/login');
      it('should login existing user', async () => {
        jest.spyOn(require('../server'), 'verifyTurnstileToken').mockResolvedValue(true);
        const email = "testuser1@test.ca"
        const password = "testpassword1"
        const response = await request(server)
          .post('/api/login')
          .send({
            email: email,
            password: password,
            'cf-turnstile-response': 'dummy-turnstile-token',
          });
        
        expect(response.statusCode).toBe(201);
        expect(response.body.message).toBe("Login successful")
      });

      it('should return 401 for invalid credentials', async () => {
        jest.spyOn(require('../server'), 'verifyTurnstileToken').mockResolvedValue(true);
        const response = await (request(server) as any)
            .post('/api/login')
            .send({
                email: 'testuser1@test.ca',
                password: 'wrongpassword',
                'cf-turnstile-response': 'dummy-turnstile-token',
            });
        
        expect(response.statusCode).toBe(401);
        expect(response.body.message).toBe("Invalid credentials");
      });

      it('returns 403 if turnstile verification fails', async () => {
        jest.spyOn(require('../server'), 'verifyTurnstileToken').mockResolvedValue(false);
      
        const response = await request(server)
          .post('/api/login')
          .send({
            email: 'any@example.com',
            password: 'anyPassword',
            'cf-turnstile-response': 'dummy-turnstile-token',
          });
      
        expect(response.statusCode).toBe(403);
        expect(response.body.error).toBe('Failed Turnstile verification');
      });

      it('should return 404 if user does not exist', async () => {
        jest.spyOn(require('../server'), 'verifyTurnstileToken').mockResolvedValue(true);
        const response = await (request(server) as any)
            .post('/api/login')
            .send({
                email: 'invalid@example.com',
                password: 'wrongpassword',
                'cf-turnstile-response': 'dummy-turnstile-token',
            });
        
        expect(response.statusCode).toBe(404);
        expect(response.body.message).toBe("User not found");
      });
    
      it('should return 500 if an error occurs', async () => {
        jest.spyOn(require('../server'), 'verifyTurnstileToken').mockResolvedValue(true);
        // You can simulate an error by manipulating the User model temporarily
        jest.spyOn(User, 'findOne').mockImplementationOnce(() => {
            throw new Error('Database error');
        });

        const response = await request(server)
            .post('/api/login')
            .send({
                email: 'test@example.com', // This is arbitrary here due to mock
                password: 'Password123',
                'cf-turnstile-response': 'dummy-turnstile-token',
            });

        expect(response.statusCode).toBe(500);
        expect(response.body.message).toContain('Server error during login:');

        // Restore the original implementation after the test
        jest.restoreAllMocks();
      });
    });

    describe('POST /api/dashboard', () => {
      console.log('Running Test Suite: POST /api/dashboard');
      let token: string;
      
      const jwtSecret = process.env.JWT_SECRET!;

      beforeAll(async () => {
          // Create a test user for example
          const newUser = new User({
              email: 'testuser@example.com',
              password: 'testpassword', // Ensure you hash this if using password hashing
          });
          await newUser.save();

          

          // Generate a valid token for the test user
          token = jwt.sign({ email: newUser.email }, jwtSecret, { expiresIn: '1h' });
      });

      // afterAll(async () => {
      //     // Clean up the database after tests
      //     await User.deleteMany({});
      //     // await mongoose.connection.close();
      // });

      it('should return 403 if no token is provided', async () => {
          const response = await request(server)
          .post('/api/dashboard')
          .send({ userEmail: 'testuser@example.com' })
          .set('Cookie', `token=`);

          expect(response.statusCode).toBe(401); // Unauthenticated
      });

      it('should return 403 for an invalid token', async () => {
          const response = await request(server)
              .post('/api/dashboard')
              .send({ userEmail: 'testuser@example.com' })
              .set('Cookie', `token=''`);

          expect(response.statusCode).toBe(403); // Unauthorized access
      });

      it('should return user information for a valid token', async () => {
          const response = await (request(server)
              .post('/api/dashboard')
              .send({ userEmail: 'testuser@example.com' })
              .set('Cookie', `token=${token}`)) as any;
              
          // Assuming you expect the response to contain user details
          expect(response.statusCode).toBe(200); // Successful access, returns null object because no test database Patient document for this email
          // expect(response.body).toEqual(expect.objectContaining({ id: 'testuser@example.com' }));
      });

      it('should return null or an appropriate response if the user does not exist', async () => {
          // Sign a token for a non-existent user
          const noUserToken = jwt.sign({ email: 'nonexistent@example.com' }, jwtSecret, { expiresIn: '1h' });

          const response = await request(server)
              .post('/api/dashboard')
              .send({ userEmail: 'nonexistent@example.com' })
              .set('Cookie', `token=${noUserToken}`);
          
          expect(response.statusCode).toBe(200); // Successful access, but user should not be found
          expect(response.body).toBeNull();  // Adjust this check according to your implementation
        })
    })

    describe('PATCH /api/update', () => {
      console.log('Running Test Suite: PATCH /api/update');
      let token: string;
      
      const jwtSecret = process.env.JWT_SECRET!;

      beforeAll(async () => {
          const newPatient : Partial<IPatient> =
            {
              id: "testuser@example.com", // Assuming email is used as the ID
              active: true,
              name: ["John Doe"], // Assuming a full name array
              telecom: ["123-456-7890", "testuser@example.com"], // Phone and email as telecom
              gender: 'male', // Set gender appropriately 
              birthDate: new Date("1983-01-14T00:00:00Z"), // Use valid Date format
              address: {
                  line: ["567 Placeholder Rd"],
                  city: "Boston",
                  stateOrProvince: "MA",
                  postalCode: "46532",
                  country: "USA"
              },
              healthConditions: [
                  { condition: "High blood pressure" },
                  { condition: "High cholesterol" },
                  { condition: "GERD" }
              ],
              medications: [
                  { medicationCode: "RX001", dosage: "5 mg" }, // Use real code here
                  { medicationCode: "RX002", dosage: "25 mg" },
                  { medicationCode: "RX003", dosage: "40 mg" }
              ],
              contacts: [
                  { name: "Jane Doe", relationship: "sister", telecom: "555-555-5555" } // Example contact
              ],
              date: new Date() // Current date
          }
        
        const assignNew = new Patient(newPatient)
        await assignNew.save();

          

          // Generate a valid token for the test user
          token = jwt.sign({ email: newPatient.id }, jwtSecret, { expiresIn: '1h' });
      });

      it('should send updated user information for a valid token', async () => {
        const newPatient : Partial<IPatient> =
            {
              id: "testuser@example.com", // Assuming email is used as the ID
              active: true,
              name: ["John Doe"], // Assuming a full name array
              telecom: ["123-456-7890", "testuser@example.com"], // Phone and email as telecom
              gender: 'male', // Set gender appropriately 
              birthDate: new Date("1983-01-14T00:00:00Z"), // Use valid Date format
              address: {
                  line: ["567 Placeholder Rd"],
                  city: "Boston",
                  stateOrProvince: "MA",
                  postalCode: "46532",
                  country: "USA"
              },
              healthConditions: [
                  { condition: "High blood pressure" },
                  { condition: "High cholesterol" },
                  { condition: "GERD" }
              ],
              medications: [
                  { medicationCode: "RX001", dosage: "5 mg" }, // Use real code here
                  { medicationCode: "RX002", dosage: "25 mg" },
                  { medicationCode: "RX003", dosage: "40 mg" }
              ],
              contacts: [
                  { name: "Jane Doe", relationship: "sister", telecom: "555-555-5555" } // Example contact
              ],
              date: new Date() // Current date
          };
          const response = await (request(server)
              .patch('/api/update')
              .send({ newData : newPatient })
              .set('Cookie', `token=${token}`)) as any;
              
          expect(response.statusCode).toBe(200); // Successful update
          expect(response.body.message).toBe("Your changes have been saved successfully.");
      });

      it('should return 400 Bad Request if the update payload is invalid or missing required fields', async () => {
        
        // Case 1: missing newData
            const response1 = await request(server)
            .patch('/api/update')
            .set('Cookie', `token=${token}`)
            .send({}); // no newData

        expect(response1.statusCode).toBe(400);
        expect(response1.body.message).toBe("Invalid request: Updated Patient data is empty");
        
        // Case 2: newData present but missing id
        const response2 = await request(server)
            .patch('/api/update')
            .send({ newData: {name: "Test"} })
            .set('Cookie', `token=${token}`);
        
        expect(response2.statusCode).toBe(400); // Successful access, but user should not be found
        expect(response2.body.message).toBe("Invalid request: Patient data missing required fields");  // Adjust this check according to your implementation
      })

      it('should return 403 if no token is provided', async () => {
        const response = await request(server)
        .patch('/api/update')
        .send({ userEmail: 'testuser@example.com' })
        .set('Cookie', `token=`);

        expect(response.statusCode).toBe(401); // Unauthenticated
      });

      it('should return 403 for an invalid token', async () => {
          const response = await request(server)
              .patch('/api/update')
              .send({ userEmail: 'testuser@example.com' })
              .set('Cookie', `token=''`);

          expect(response.statusCode).toBe(403); // Unauthorized access
      });

      it('should return 500 if an error occurs', async () => {
        // You can simulate an error by manipulating the User model temporarily
        // jest.spyOn(Patient, 'updateOne').mockImplementationOnce(() => {
        //     throw new Error('Database error, unable to save updated data');
        // });
        jest.spyOn(Patient, 'updateOne').mockImplementationOnce(() => {
          throw new Error('Database error');
      });

        const newPatient : Partial<IPatient> =
            {
              id: "testuser@example.com", // Assuming email is used as the ID
              active: true,
              name: ["John Doe"], // Assuming a full name array
              telecom: ["123-456-7890", "testuser@example.com"], // Phone and email as telecom
              gender: 'male', // Set gender appropriately 
              birthDate: new Date("1983-01-14T00:00:00Z"), // Use valid Date format
              address: {
                  line: ["567 Placeholder Rd"],
                  city: "Boston",
                  stateOrProvince: "MA",
                  postalCode: "46532",
                  country: "USA"
              },
              healthConditions: [
                  { condition: "High blood pressure" },
                  { condition: "High cholesterol" },
                  { condition: "GERD" }
              ],
              medications: [
                  { medicationCode: "RX001", dosage: "5 mg" }, // Use real code here
                  { medicationCode: "RX002", dosage: "25 mg" },
                  { medicationCode: "RX003", dosage: "40 mg" }
              ],
              contacts: [
                  { name: "Jane Doe", relationship: "sister", telecom: "555-555-5555" } // Example contact
              ],
              date: new Date() // Current date
          };

        const response = await request(server)
            .patch('/api/update')
            .send( {newData: newPatient} )
            .set('Cookie', `token=${token}`);

        expect(response.statusCode).toBe(500);
        expect(response.body.message).toContain('Database error, unable to save updated data');

        // Restore the original implementation after the test
        jest.restoreAllMocks();
      });
    })
});
  