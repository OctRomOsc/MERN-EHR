import mongoose, { Schema, Document } from 'mongoose';

// Define the sub-schemas

interface IContact {
    name: string;
    relationship?: string; // Relationship to the patient
    telecom?: string; // Contact information (phone/email)
}

interface ICondition {
    condition: string; // Code for the condition (ICD-10, SNOMED, etc.)
    onsetDate?: Date; // Date when the condition started
}

interface IMedication {
    medicationCode: string; // Code for the medication (e.g., RxNorm)
    dosage?: string; // Dosage instructions
}

// Define the main Patient schema interface
export interface IPatient extends Document {
    id: string; // FHIR requires an id
    active?: boolean;
    name: string[]; // Store names as an array for multi-part names
    telecom?: string[]; // Email, phone, etc.
    gender?: 'male' | 'female' | 'other' | 'unknown'; // Gender options
    birthDate?: Date; // Patient's date of birth
    address?: {
        line?: string[];
        city?: string;
        stateOrProvince?: string;
        postalCode?: string;
        country?: string;
    }; // Address structure
    healthConditions?: ICondition[]; // Array of health conditions
    medications?: IMedication[]; // Array of medications
    contacts?: IContact[]; // Array of emergency contacts
    date?: Date; // Date of record creation or modification
}

// Define the sub-schemas for Mongoose
const ContactSchema = new Schema<IContact>({
    name: { type: String, required: true },
    relationship: { type: String, required: false },
    telecom: { type: String, required: false },
});

const ConditionSchema = new Schema<ICondition>({
    condition: { type: String, required: true }, // Check if HL7/FHIR includes conditionName and conditionCode?
    onsetDate: { type: Date, required: false },
});

const MedicationSchema = new Schema<IMedication>({
    medicationCode: { type: String, required: true }, // Reference to a medication resource
    dosage: { type: String, required: false },
});

// Define the main Patient schema
const PatientSchema = new Schema<IPatient>({
    id: { type: String, required: true }, // FHIR requires an id
    active: { type: Boolean, default: true },
    name: { type: [String], required: true }, // Store names as an array for multi-part names
    telecom: { type: [String], required: false }, // Email, phone, etc.
    gender: { type: String, enum: ['male', 'female', 'other', 'unknown'], required: false },
    birthDate: { type: Date, required: false },
    address: {
        line: { type: [String], required: false },
        city: { type: String, required: false },
        stateOrProvince: { type: String, required: false },
        postalCode: { type: String, required: false },
        country: { type: String, required: false },
    },
    healthConditions: [ConditionSchema],
    medications: [MedicationSchema],
    contacts: [ContactSchema],
    date: { type: Date, default: Date.now },
});

// Export the Patient model
const Patient = mongoose.model<IPatient>('Patient', PatientSchema);
export default Patient;