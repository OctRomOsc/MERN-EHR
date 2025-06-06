import mongoose from 'mongoose';
import dotenv from "dotenv";
import path from "path";
import {Patient, IPatient} from '../models'; // Ensure this path is correct



dotenv.config({ path: path.resolve(process.cwd(), '../.env') }); //must be run from ./backend to access .env in root



mongoose.connect(
    process.env.MONGODB_URI!
);

const patientSeed : Array<{}> = [
    {
        id: "dana@gmail.com", // Assuming email is used as the ID
        active: true,
        name: ["John Doe"], // Assuming a full name array
        telecom: ["456-153-6583", "dana@gmail.com"], // Phone and email as telecom
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
    },
    {
        id: "dana@gmail.com", // Assuming email is used as the ID
        active: true,
        name: ["Jose Martinez"],
        telecom: ["456-153-6583", "dana@gmail.com"],
        gender: 'male',
        birthDate: new Date("1933-09-24T00:00:00Z"),
        address: {
            line: ["346 Placeholder St", "APT 304"],
            city: "Boston",
            stateOrProvince: "MA",
            postalCode: "46532",
            country: "USA"
        },
        healthConditions: [
            { condition: "Arthritis" }
        ],
        medications: [
            { medicationCode: "RX004", dosage: "800 mg" } // Use real code here
        ],
        contacts: [
            { name: "John Doe", relationship: "friend", telecom: "555-123-4567" } // Example contact
        ],
        date: new Date() // Current date
    },
    // Add more patients similarly...
];

// Remove existing patients and insert new seeds
const seedPatients : Function = async () => {
    try {
        // Remove existing patients
        await Patient.deleteMany({});
        
        // Insert new seeds
        const data : any = await Patient.insertMany(patientSeed);
        
        console.log(data.length + ' records inserted!');


        const check : Array<object> = await Patient.find();
        console.log(check);
        
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

// Call the seeding function
seedPatients();