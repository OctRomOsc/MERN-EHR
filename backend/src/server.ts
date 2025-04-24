import express, { Request, Response } from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from "dotenv";
import path from "path";
import jwt from 'jsonwebtoken';
import rateLimit, { RateLimitRequestHandler } from 'express-rate-limit';
import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import fs from 'fs';
import { Tspec, TspecDocsMiddleware } from "tspec";
import {User, IUser} from './models'; // Adjust the path as necessary


dotenv.config({ path: path.resolve(process.cwd(), '../.env') }); //must be run from ./backend to access .env in root
const app: express.Express = express();
const port: number | string = process.env.PORT || 3001;
const jwtSecret: string = process.env.JWT_SECRET!;
const mongoUri: string = process.env.MONGODB_URI!;

// mongoose.connect(mongoUri).catch((err : any) => console.log(err));
// mongoose.connection.on("error", (err : any) => {
//   console.log(err);
// });

// Set up rate limiter: maximum of 100 requests per 15 minutes per IP
const limiter : RateLimitRequestHandler = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
    message: "Too many requests from this IP, please try again after 15 minutes",
});

app.use(express.json());
app.use(limiter);
app.use(cors());

// Swagger configuration
const swaggerOptions = {
  swaggerDefinition: {
      openapi: "3.0.0", // Specify the API version
      info: {
          title: "API Documentation",
          version: "1.0.0",
          description: "API documentation using Swagger",
      },
      servers: [
          {
              url: `http://localhost:${port}`, // Change this to your production URL
          },
      ],
  },
  apis: ["./src/**/*.ts"], // Path to the API docs (JSDoc comments)
};

// Generate Swagger specification
const swaggerDocs = swaggerJsdoc(swaggerOptions);
app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Save the Swagger documentation to a file
const outputFilePath = __dirname+'/docs'; // Specify the output file path
console.log(outputFilePath);

if (!fs.existsSync(outputFilePath)){
    fs.mkdirSync(outputFilePath);
}

fs.writeFileSync(outputFilePath+'/swagger.json', JSON.stringify(swaggerDocs, null, 2)); // Save the file


/**
 * @openapi
 * /api/swagger.json:
 *   get:
 *     summary: OpenAPI Spec JSON file
 *     description: Endpoint for a user to extract API Spec in JSON format
 *     operationId: getSwaggerJson
 *     tags:
 *       - Documentation
 *     responses:
 *       200:
 *         description: Successful response
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               additionalProperties: true
 */
app.get('/api/swagger.json', (req: Request, res: Response) => {
    console.log(outputFilePath);
    res.status(200).send(swaggerDocs); // Serve the Swagger JSON file for external access
});

//test

/**
 * @openapi
 * /api/test:
 *   get:
 *     summary: Test endpoint
 *     description: A simple test to check the server
 *     operationId: getTest
 *     tags:
 *       - Test
 *     responses:
 *       200:
 *         description: Successful response
 */

app.get('/api/test', (req : Request, res : Response) => {
    // console.log(mongoURI);
    try {
    console.log("GET /test called");
    res.send(port+' buiahbwd');
    }
    catch (err : any){
      res.send(err)
    }
    
  })

// Registration Route
/**
 * @openapi
 * /api/register:
 *   post:
 *     summary: Register a new user
 *     description: Register a new user in the system
 *     operationId: postRegister
 *     tags:
 *       - User
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *             required:
 *               - email
 *               - password
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Error registering user
 */
app.post('/api/register', async (req: Request, res: Response) => {
    try {
        const user : IUser = new User({
            email: req.body.email,
            password: req.body.password // Password will be hashed in the schema
        });

        await user.save(); // Save user to the database
        // res.status(201).send('User registered');
        res.status(201).json({email: user.email})
    } catch (err : any) {
        res.status(400).json({error: err.errorResponse.errmsg});
    }
});

// Login Route
/**
 * @openapi
 * /api/login:
 *   post:
 *     summary: Login existing user
 *     description: Login user account with email and password
 *     operationId: postLogin
 *     tags:
 *       - User
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *             required:
 *               - email
 *               - password
 *     responses:
 *       201:
 *         description: User logged in successfully
 *       400:
 *         description: Error loggin in user
 */
app.post('/api/login', async (req: Request, res: Response ) => {
    try {
        const user : IUser | null  = await User.findOne({ email: req.body.email });
        
        if (user && (await user.checkPassword(req.body.password))) {
            const token : string = jwt.sign({ email: user.email }, jwtSecret, { expiresIn: '1h' });
            res.json({ token });
            console.log(token);
            
            }

        else {
            res.status(401).send('Invalid credentials');
        }
        
    } catch (err : any) {
        console.error('Error during login:', err);
        res.status(500).json({message: "Server error during login: " + err.message});
    }
});

// Protected Route
app.get('/dashboard', async (req: Request, res: Response) => {
    const token : string | undefined = req.headers['authorization']?.split(' ')[1];
    const user : IUser | null  = await User.findOne({ email: req.body.email });

    if (token) {
    jwt.verify(token, jwtSecret, (err: any, user: any) => {
        if (err) res.sendStatus(403); // Unauthorized access
        res.send(user);
        
    });
    
    }
    else {
        res.sendStatus(401); // Unauthenticated
    }

});

// Root route
app.get('/', (req: Request, res: Response) => {
    res.send('Hello World!');
});


// Close database connection on exit

process.on('SIGINT', async () => {
	try {
	  await mongoose.connection.close();  // Destroy the connection pool
	  console.log('Closed the database connection.');
	  process.exit(0);  // Exit the process
	} catch (err : any) {
	  console.error('Error closing the database connection:', err.message);
	  process.exit(1);  // Exit with error code
	}
  });

// Start the server
app.listen(port, () => {
    console.log(`Express is listening at http://localhost:${port}`);
});

export default app;