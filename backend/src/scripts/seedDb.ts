import mongoose from 'mongoose';
import dotenv from "dotenv";
import path from "path";
import {Patient, IPatient} from '../models';



dotenv.config({ path: path.resolve(process.cwd(), '../.env') }); //must be run from ./backend to access .env in root



mongoose.connect(
    process.env.MONGODB_URI!
);

const patientSeed : Array<{}> = [
    {
        id: "placeholder@gmail.com",
        active: true,
        name: ["John Doe"], 
        telecom: ["123-456-7890", "placeholder@gmail.com"], 
        gender: 'male', 
        birthDate: new Date("1983-01-14T00:00:00Z"), 
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
            { medicationCode: "RX001", dosage: "5 mg" }, 
            { medicationCode: "RX002", dosage: "25 mg" },
            { medicationCode: "RX003", dosage: "40 mg" }
        ],
        contacts: [
            { name: "Jane Doe", relationship: "sister", telecom: "555-555-5555" }
        ],
        date: new Date()
    },
    {
        id: "placeholder@gmail.com",
        active: true,
        name: ["Jose Martinez"],
        telecom: ["123-456-7890", "placeholder@gmail.com"],
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
            { medicationCode: "RX004", dosage: "800 mg" }
        ],
        contacts: [
            { name: "John Doe", relationship: "friend", telecom: "098-765-4321" }
        ],
        date: new Date() 
    },
    {
        id: "admin@admin.ca", 
        active: true,
        name: ["admin"],
        telecom: ["123-456-7890", "admin@admin.ca"],
        gender: 'male',
        birthDate: new Date("1900-01-01T00:00:00Z"),
        address: {
            line: ["001 Placeholder St", "APT 001"],
            city: "Toronto",
            stateOrProvince: "ON",
            postalCode: "M6M4A7",
            country: "CAN"
        },
        healthConditions: [
            { condition: "Arthritis" }
        ],
        medications: [
            { medicationCode: "RX004", dosage: "800 mg" } 
        ],
        contacts: [
            { name: "John Doe", relationship: "friend", telecom: "098-765-4321" } 
        ],
        date: new Date() 
    },
   
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
        
        await mongoose.connection.close();
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

// Call the seeding function
seedPatients();