// import { describe, it, expect } from '@jest/globals';
import request from 'supertest';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import  app  from '../server'; // Import your app
import {User} from '../models';

dotenv.config({ path: path.resolve(process.cwd(), '../.env') });
const mongoTestUri: string = process.env.MONGODB_TEST_URI!;
const port: number | string = process.env.PORT || 3001;




describe('Server Routes', () => {

  //   Important: Make sure your app is actually running 
  //   and the database is connected (this may be in a beforeEach)
  let server : any;
  let connection : any;
  beforeAll(async () => {
    
    try {
      // Crucial: Use a unique test database URI.  DO NOT reuse
      // production credentials!
      
      if (!mongoTestUri) {
        throw new Error("MONGO_TEST_URI environment variable not set.");
      }

      // Important: Create a new connection for tests
      connection = await mongoose.connect(mongoTestUri);

      // Initialize the server only after successful connection.
      server = app.listen(port, () => {
        // console.log(`Server listening on port ${port}`);
      }); 

      // Clear database before test
      await User.deleteMany({}); // Clear the User collection

    } catch (error) {
      console.error("Error during setup:", error);
      // This is crucial: if connection fails, the rest of the tests won't run.
      await mongoose.connection.close();
      throw error; // Re-throw to stop the test suite
    }

  });
  afterAll(async () => {
    try {
      // Properly close the server, releasing resources
      if (server){
        server.close();
      }
      
      // Properly close the database connection
      if (mongoose.connection) {
        await mongoose.connection.close();
    }
    // const models = mongoose.models;
    //   for (const modelName in models) {
    //       if (Object.hasOwnProperty.call(models, modelName)) {
    //           await models[modelName].deleteMany({}); // Clear the collection
    //       }
    //   }
      console.log('Closed the database connection.');
      
    } catch (error) {
      console.error('Error during teardown:', error);
    }
	  // process.exit(0);  // Exit the process
  });


  it('should create and register new user', async () => {

    const newUser : any = {email: "testuser@test.ca", password: "testpassword"};
    const response = await request(app)
      .post('/api/register')
      .send(newUser);
    
    expect(response.statusCode).toBe(201); // or whatever the expected status code
    expect(response.body.email).toBe(newUser.email);
    
    
  });

  it('should not allow you to create and register a new user with taken email', async () => {

    const newUser : any = {email: "testuser@test.ca", password: "testpassword1"};
    const response = await request(app)
      .post('/api/register')
      .send(newUser);
    
    expect(response.statusCode).toBe(400); // or whatever the expected status code
    expect(response.body.error).toEqual(expect.stringContaining("E11000"));
    
  });


});


// ... (rest of your server code)