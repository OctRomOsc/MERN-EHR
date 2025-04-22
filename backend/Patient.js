const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ContactSchema = new Schema({
    name: { type: String, required: true },
    relation: { type: String, required: false },
    telecom: { type: String, required: false },
});

const ConditionSchema = new Schema({
    condition: { type: String, required: true }, // You may want to define a condition code here (e.g., ICD-10)
    onsetDate: { type: Date, required: false },
});

const MedicationSchema = new Schema({
    medicationCode: { type: String, required: true }, // Reference to a medication resource
    dosage: { type: String, required: false },
});

const PatientSchema = new Schema({
    id: { type: String, required: true }, // FHIR requires an id
    active: { type: Boolean, default: true },
    name: { type: [String], required: true }, // Store names as an array for multi-part names
    telecom: { type: [String], required: false }, // Email, phone, etc.
    gender: { type: String, enum: ['male', 'female', 'other', 'unknown'], required: false },
    birthDate: { type: Date, required: false },
    address: { type: Object, required: false }, // Use structured addresses for FHIR compliance
    healthConditions: [ConditionSchema],
    medications: [MedicationSchema],
    contacts: [ContactSchema],
    date: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Patient", PatientSchema);