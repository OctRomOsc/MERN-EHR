import express, { Request, Response } from 'express';

import mongoose from 'mongoose';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from "dotenv";
import path from "path";
import jwt from 'jsonwebtoken';
import helmet from 'helmet';
import rateLimit, { RateLimitRequestHandler } from 'express-rate-limit';
import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import fs from 'fs';


import {Server} from 'http'; //for types
import {AddressInfo} from 'net'; // for types

const mode : string = process.env.NODE_ENV!;
if (mode === 'production') {
    dotenv.config({ path: path.resolve(process.cwd(), '../.env.production') }); // must be run from ./backend to access .env in root
}
else{
    dotenv.config({ path: path.resolve(process.cwd(), '../.env') }); // Default to .env for development
}
    
const app: express.Express = express();
const port: number | string = process.env.PORT || 3001;
const apiUrl: string = process.env.API_URL!;
const jwtSecret: string = process.env.JWT_SECRET!;
const cloudflareKey : string = process.env.TURNSTILE_SECRET_KEY!; // your secret key
const verificationUrl : string = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';

console.log(`Logging to check: ${port} and ${apiUrl}`);


export const verifyTurnstileToken = async (cfToken: string): Promise<boolean> => {
    
  
    const res = await fetch(verificationUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        secret: cloudflareKey,
        response: cfToken,
      }),
    });
  
    const data = await res.json();
  
    return data.success === true;
  };

//// MODELS
import {User, IUser, Patient, IPatient} from './models'; 

//// DATABASE (MONGODB)
let mongoUri : string
if (mode === 'test'){
    mongoUri = process.env.MONGODB_TEST_URI!;
} else {
    mongoUri = process.env.MONGODB_URI!;
}

mongoose.connect(mongoUri).catch((err : any) => console.log(err));
mongoose.connection.on("error", (err : any) => {
  console.log(err);
});




//// MIDDLEWARES

// Set up rate limiter: maximum of 100 requests per 15 minutes per IP
const limiter : RateLimitRequestHandler = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
    message: "Too many requests from this IP, please try again after 15 minutes",
});

// Define the CSP directives
const cspDirectives : any  = {
    "default-src": ["'self'"],
    "script-src": [
        "'self'",
    "https://challenges.cloudflare.com"
    ],
    "style-src": ["'self'", "https://fonts.googleapis.com/"],
    "img-src": ["'self'", "data:"],
    "font-src": ["'self'", "https://fonts.gstatic.com"],
    "connect-src": [
        "'self'",
        "https://challenges.cloudflare.com",
        apiUrl
    ],
    "object-src": ["'none'"],
    "base-uri": ["'self'"],
    "form-action": ["'self'"],
    "block-all-mixed-content": [],
    "upgrade-insecure-requests": [],
  };

app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  }));
app.use(limiter);
app.use(
    helmet.contentSecurityPolicy({
      directives: cspDirectives,
    })
  );





//// ROUTES

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
                url: mode==='production' ? apiUrl : `${apiUrl}${port}`, // Change this to your production URL
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
    res.status(200).send(swaggerDocs); // Serve the Swagger JSON file for external access
});

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
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                   
 * 
 *       400:
 *         description: Error registering user
 */
app.post('/api/register', async (req: Request, res: Response)  => {

    const cfToken : string = req.body['cf-turnstile-response'];
    if (!cfToken) {
        res.status(400).json({ error: 'Missing Turnstile token' });
        return
    }

    const isHuman : boolean = await verifyTurnstileToken(cfToken);
    if (!isHuman) {
        res.status(403).json({ error: 'Failed Turnstile verification' });
        return
    }

    try {
        const user : IUser = new User({
            email: req.body.email,
            password: req.body.password // Password will be hashed in the schema
        });

        await user.save(); // Save user to the database
        res.status(201).send({message:'User registered'});
        // res.status(201).json({email: user.email})
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
 *         description: Error logging in user
 */
app.post('/api/login', async (req: Request, res: Response )  => {

    const cfToken : string = req.body['cf-turnstile-response'];
    if (!cfToken) {
        res.status(400).json({ error: 'Missing Turnstile token' });
        return
    }

    const isHuman : boolean = await verifyTurnstileToken(cfToken);
    if (!isHuman) {
        res.status(403).json({ error: 'Failed Turnstile verification' });
        return
    }

    try {
        const user : IUser | null  = await User.findOne({ email: req.body.email });
        
        if (user && (await user.checkPassword(req.body.password))) {
            const jwtToken : string = jwt.sign({ email: user.email }, jwtSecret, { expiresIn: '1h' });

            res.cookie('token', jwtToken, {
                httpOnly: true,
                secure: true, // true if production process.env.NODE_ENV === 'production' ||
                sameSite: 'none', // or 'Lax' based on your needs
                maxAge: 60 * 60 * 1000, // 1 hour
                partitioned: true,
              });
            res.status(201).json({ message: 'Login successful' });
            
            }

        else if (user && !(await user.checkPassword(req.body.password))) {
            res.status(401).json({message : 'Invalid credentials'});
        }

        else {
            res.status(404).json({message : 'User not found'});
        }
        
    } catch (err : any) {
        console.error('Error during login:', err);
        res.status(500).json({message: "Server error during login: " + err.message});
    }
});

// Logout Route
/**
 * @openapi
 * /api/logout:
 *   post:
 *     summary: Logout current user
 *     description: Clears the authentication cookie, logging out the user.
 *     operationId: postLogout
 *     tags:
 *       - User
 *     responses:
 *       200:
 *         description: Successfully logged out
 *       401:
 *         description: User not authenticated
 */
app.post('/api/logout', async (req: Request, res: Response) => {
    res.clearCookie('token', {
      httpOnly: true,
      secure: true, // true if production process.env.NODE_ENV === 'production' ||,
      sameSite: 'none',
    });
    res.json({ message: 'Logged out successfully' });
  });

// Protected dashboard Route
/**
 * @openapi
 * /api/dashboard:
 *   post:
 *     summary: Retrieve user patient data
 *     description: Queries the user's id (email address) and returns their personal medical information.
 *     operationId: postDashboard
 *     tags:
 *       - User
 *       - Patient 
 *     responses:
 *       201:
 *         description: Successfully retrieved Patient data
 *       401:
 *         description: Error retrieving Patient data
 */
app.post('/api/dashboard', async (req: Request, res: Response) => {
    const jwtToken : string | undefined = req.cookies['token'];
    if (!jwtToken) {
        res.status(401).send({ message: "No token received." });
        return
    }

    jwt.verify(jwtToken, jwtSecret, async (err: any, decoded: any) => {
        if (err) {
            return res.status(403).send({ message: "Invalid token.", error: err });
            
        }

        try {
            const patient: IPatient | null = await Patient.findOne({ id: req.body.userEmail });
            res.status(200).json(patient);
        } catch (err: any) {
            res.status(500).json({ error: err, message: "Database error, unable to retrieve data" });
        }
    });

    });


/**
 * @openapi
 * /api/update:
 *   patch:
 *     summary: Update user patient data
 *     description: Updates the user's patient information with what they entered.
 *     operationId: postUpdate
 *     tags:
 *       - Patient 
 *     responses:
 *       201:
 *         description: Successfully updated Patient data
 *       401:
 *         description: Error updating Patient data
 */
app.patch('/api/update', async (req: Request, res: Response) => {
    const jwtToken : string | undefined = req.cookies['token'];
    const updatedData : IPatient = req.body.newData

    if (!jwtToken) {
        res.status(401).json({ message: "No token received." });
        return
    }

    // Verify token using callback
    jwt.verify(jwtToken, jwtSecret, async (err: any, decoded: any) => {
        if (err) {
            return res.status(403).json({ message: "Invalid token.", error: err });
        }

        // Token is valid, proceed with payload validation
        if (!updatedData) {
            return res.status(400).json({ message: "Invalid request: Updated Patient data is empty" });
        }

        if (
            typeof updatedData !== 'object' ||
            !updatedData.id ||
            !updatedData.active ||
            !updatedData.name
        ) {
            return res.status(400).json({ message: "Invalid request: Patient data missing required fields" });
        }

        try {
            await Patient.updateOne({ id: updatedData.id }, updatedData, { upsert: true });
            res.status(200).json({ message: 'Your changes have been saved successfully.' });
        } catch (err: any) {
            res.status(500).json({ error: err, message: "Database error, unable to save updated data" });
        }
    });
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
const server : Server = app.listen(port, () => {
    const addressInfo = server.address() as AddressInfo; // Type assertion
    const assignedPort : number = addressInfo.port; // Get the dynamically assigned port
    console.log(`Express is listening at port: ${assignedPort}`);
});

export {app, server};