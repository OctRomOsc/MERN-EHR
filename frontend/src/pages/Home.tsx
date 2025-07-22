import {useState, useEffect, useContext} from 'react';
import { AuthContext } from '../context/AuthProvider.tsx';
// import {IPatient} from '../../../backend/src/models/Patient.ts'
import {Modal} from "../components"
import '../App.css';
import { Document } from 'mongoose';

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

interface IPatient extends Document {
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

function Home() {
    const authContext = useContext(AuthContext);
    const userEmail : string | undefined = authContext?.user
    
    useEffect(() => {
      console.log("Auth state after login:", authContext?.isAuthenticated);
    }, [authContext?.isAuthenticated]);

    const [modalContent, setModalContent] = useState({ title: "", message: "" });
    const [modalIsOpen, setModalIsOpen] = useState(false); // State to control modal visibility

    const closeModal = () => {
      setModalIsOpen(false);
    };
    
    const [data, setData] = useState<Partial<IPatient>>({
      active: true,
      id: '',
      gender:'unknown',
      name: [],
      address: {
        line: [],
        city: '',
        stateOrProvince: '',
        postalCode: '',
        country: ''},

      telecom: [],
      birthDate: new Date(),
      healthConditions: [],
      medications: [],
      contacts: [{
        name: '',
        relationship: '',
        telecom: ''}]
      } );
    // const [testData, setTestData] = useState<string>("");
    const port : string = process.env.PORT!;
    let apiUrl : string = process.env.VITE_API_URL!; // Default for local dev
    const mode : string = process.env.NODE_ENV!;
    
    
    if (mode !== "production"){
      apiUrl+=port
    }
    
    
    const [isEditing, setIsEditing] = useState(false);
    const [originalData, setOriginalData] = useState({});

    const handleEditClick = () => {
      setOriginalData(data)
      setIsEditing(true);
    };

    const handleSaveClick = () => {
      // Save logic here
      setData(data)
      setIsEditing(false);
      setModalContent({
        title: "Verify your changes",
        message: "Are all the changes you have made accuarate?"
      });
      setModalIsOpen(true);
    };

    const handleReset = () => {
      if (originalData) {
        setData({ ...originalData }); // revert to original
      }
      setIsEditing(false); // optionally disable editing after reset
    };

    const handleChange = (e : any) => {
      // setData({
      //   ...data,
      //   [e.target.name]: e.target.value,
      // });
      const { name, value } = e.target;
      setData(prev => ({
        ...prev,
        [name]: value,
      }));
    }

    const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      setData(prev => {
        if (name ==='line'){
          return {
            ...prev,
            address: {
              ...prev.address,
              line: [value, ...(prev.address?.line?.slice(1) || [])],
            }
          };
        } else {
          return {
        ...prev,
        address: {
          ...prev.address,
          [name]: value,
        }
      }}
    });
    }

    const handleTelecomChange = ( e: React.ChangeEvent<HTMLInputElement>, index: number) => { // index of the telecom item being changed
              const { value } = e.target;
              setData(prev => {
              const newTelecom = [...prev.telecom!];
              newTelecom[index] = value; // since each item is a string
              return {
                ...prev,
                telecom: newTelecom,
              };
            });
          };

    const dashboard = async () => {
      try{
                
          const response : Response = await fetch(`${apiUrl}/api/dashboard` , {
            method: "POST",
            headers: {
              'Content-Type': 'application/json'
            },
            credentials: 'include', // <-- important to include cookies
            body:JSON.stringify({userEmail})//user
          })
  
          // let result : Array<object> = await response.json()
          let result : object = await response.json()
          
          setData(result);
          
      }
      catch (err : any ){
        console.error(err)
      }
    }

    const update = async () => {
      try{
        const response : any = await fetch(`${apiUrl}/api/update` , {
          method: "PATCH",
          headers: {
            'Content-Type': 'application/json'
          },
          credentials: 'include', // <-- important to include cookies
          body:JSON.stringify({newData:data})//user
        })
        
        
        const successMessage = response.message 
        setModalContent({
          title: "Update success!",
          message: successMessage
        });
      } catch(err : any ) {
        console.error(err)
        setModalContent({
          title: "Database error during update!",
          message: "An error occurred and your changes have not been saved."
        });
      }
    }

    const logout = async () => {
      try{
        
          const response : Response = await fetch(`${apiUrl}/api/logout` , {
            method: "POST",
            headers: {
              'Content-Type': 'application/json'
            },
            credentials: 'include', // <-- important to include cookies
          })
  
          // let result : Array<object> = await response.json()
          let result : any = await response.json()
          
          
          // setData(result);
          if (result.message === "Logged out successfully"){
            authContext?.logout();
          }
          
          
      }
      catch (err : any){
        console.error(err)
      }
    }


    useEffect(() => {
      dashboard(); // Fetch data when component mounts
    }, []);
  
    return (
      <>

        <div className="bg-gray-50 min-h-screen p-6 font-sans text-gray-800">
          {/* <!-- Header / Logout Button --> */}
          <div className='flex justify-between'>
            <div className='flex justify-start mb-4'>
              {!isEditing ? (
                    <button onClick={handleEditClick} className="btn btn-primary bg-gray-200 text-black px-4 py-2 rounded shadow hover:bg-blue-700 transition">Edit</button>
                  ) : (
                    <>
                    <button onClick={handleSaveClick} className="btn btn-success bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700 transition">Save</button>
                    <button
                    onClick={handleReset}
                    className="ml-2 btn btn-secondary"
                    title="Reset changes"
                  > Reset</button>
                  </>
                  )}
            </div>
            <div className="flex justify-end mb-4">
              <button className="bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700 transition" onClick={logout}>Logout</button>
            </div>

          </div>

          

          {/* <!-- Main Content --> */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* <!-- Address & Name Card --> */}
            <div className="bg-white p-6 rounded shadow hover:shadow-lg transition">
              <h2 className="text-xl font-semibold mb-4 border-b pb-2 border-gray-200">Contact Information</h2>
              
              <div className="mb-4 space-y-1">
                <h3 className="font-medium mb-1">Address</h3>
                <h4 className=" mb-1">Street number and name</h4>
                <input name="line" className={`${(!isEditing ? "cursor-not-allowed" : "")} "w-full border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-300"`}
                value={data.address!.line![0] ?? ''}
                onChange={handleAddressChange} 
                disabled={!isEditing}></input>
                <h4 className=" mb-1">Municipality</h4>
                <input name="city" className={`${(!isEditing ? "cursor-not-allowed" : "")} "w-full border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-300"`}
                value={data.address!.city ?? ''}
                onChange={handleAddressChange}  
                disabled={!isEditing}></input>
                <h4 className=" mb-1">State or Province</h4>
                <input name="stateOrProvince" className={`${(!isEditing ? "cursor-not-allowed" : "")} "w-full border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-300"`}
                value={data.address!.stateOrProvince ?? ''}
                onChange={handleAddressChange}  
                disabled={!isEditing}></input>
                <h4 className=" mb-1">Country</h4>
                <input name="country" className={`${(!isEditing ? "cursor-not-allowed" : "")} "w-full border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-300"`}
                value={data.address!.country ?? ''}
                onChange={handleAddressChange}  
                disabled={!isEditing}></input>
                <h4 className=" mb-1">Postal Code</h4>
                <input name="postalCode" className={`${(!isEditing ? "cursor-not-allowed" : "")} "w-full border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-300"`}
                value={data.address!.postalCode ?? ''}
                onChange={handleAddressChange}  
                disabled={!isEditing}></input>
              </div>
              
              <div className="mb-4">
                <h3 className="font-medium mb-1">Phone Number</h3>
                <input name="phone" className={`${(!isEditing ? "cursor-not-allowed" : "")} "w-full border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-300" `}
                value={data.telecom![0] ?? ''}
                onChange={(e) => handleTelecomChange(e, 0)}
                disabled={!isEditing} />
              </div>
              
              <div>
                <h3 className="font-medium mb-1">Email</h3>
                <input name="email" className={`${(!isEditing ? "cursor-not-allowed" : "")} "w-full border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-300" `}
                value={data.telecom![1] ?? ''}
                onChange={(e) => handleTelecomChange(e, 1)}
                disabled={!isEditing} />
              </div>
            </div>

            {/* <!-- Additional Info Card --> */}
            <div className="bg-white p-6 rounded shadow hover:shadow-lg transition">
              <h2 className="text-xl font-semibold mb-4 border-b pb-2 border-gray-200">Personal Information</h2>
              

              <div className="mb-4">
                <h3 className="font-medium mb-1">Name</h3>
                <input name="name" className={`${(!isEditing ? "cursor-not-allowed" : "")} "w-full border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-300"`}
                value={data.name![0] ?? ''}
                disabled={!isEditing}></input>
              </div>


              <div className="mb-4">
                <h3 className="font-medium mb-1">Gender</h3>
                <select className={`${(!isEditing ? "cursor-not-allowed" : "")} "w-full border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-300" `}
                name="gender" 
                value={data.gender || "unknown"}
                disabled={!isEditing} 
                onChange={handleChange}>
                  <option value="unknown">Unknown</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
              
              <div className="mb-4">
                <h3 className="font-medium mb-1">Date of Birth</h3>
                <input name="birthDate" className={`${(!isEditing ? "cursor-not-allowed" : "")} "w-full border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-300"`}
                value={data.birthDate?.toString().slice(0,10)}
                onChange={handleChange}
                disabled={!isEditing}></input>
              </div>
              
              <div className="mb-4">
                <h3 className="font-semibold mb-2 border-b pb-1 border-gray-200">Health Conditions</h3>
                {data.healthConditions && data.healthConditions.length > 0 ? (
                  <ul className="list-disc list-inside">
                    {data.healthConditions.map((conditionObj, index) => (
                      <li key={index}>{conditionObj.condition}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-500">No health conditions listed.</p>
                )}
              </div>
              
              <div className="mb-4">
                <h3 className="font-semibold mb-2 border-b pb-1 border-gray-200">Medications</h3>
                {data.medications && data.medications.length > 0 ? (
                  <ul className="list-disc list-inside">
                    {data.medications.map((medicationObj, index) => (
                      <li key={index}>{medicationObj.medicationCode} Dose: {medicationObj.dosage}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-500">No medications listed.</p>
                )}
              </div>
              
              <div>
                <h3 className="font-semibold mb-2 border-b pb-1 border-gray-200">Contacts</h3>
                {data.contacts && data.contacts.length > 0 ? (
                  <ul className="list-disc list-inside">
                    {data.contacts.map((contactObj, index) => (
                      <li key={index}>Name: {contactObj.name} | Relation: {contactObj.relationship} | Contact Info: {contactObj.telecom}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-500">No emergency contacts listed.</p>
                )}
              </div>
            </div>
          </div>
        </div>

        <Modal
        isOpen={modalIsOpen}
        onClose={closeModal}
        onSave={update}
        title={modalContent.title}
        message={modalContent.message}
      />
      
      </>
    )
}

export default Home;