import {useRef, useState, useEffect} from "react";
import { useClickAway } from "use-click-away";
import Draggable from 'react-draggable';


const Modal = ({ isOpen, onClose, onSave, title, message } : any) => {
    const [saveButton, setSaveButton] = useState(false)
    const clickRef = useRef<HTMLDivElement | null>(null);
    //The save modal does not have click-away close, the error modal does
    const clickAwayRef = saveButton ? null : clickRef;
    useClickAway(clickAwayRef, () => {
        onClose();
    });
    
    
    // Run this effect when `title` or `isOpen` changes
    useEffect(() => {
        if (title.includes('Verify')) {
            setSaveButton(true);
        } else {
            setSaveButton(false);
        }
    });
    const DraggableComponent = Draggable as unknown as React.ComponentType<any>; //Throwing a TS error unless this is done

    if (!isOpen) return null; // Don't render the modal if it's not open
    return (
        
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center"
            onClick={() => {
                if (!saveButton) {
                    onClose(); // clicking on overlay counts as clicking away
                }
            }}
        >
            <div ref={clickRef} onClick={(e) => e.stopPropagation()}>
            <DraggableComponent>
                <div className="bg-tertiary text-white p-6 rounded-lg shadow-lg max-w-sm w-full">
                    <h2 className="text-lg font-bold mb-2">{title}</h2>
                    <p className="mb-4">{message}</p>
                    <div className="flex justify-between mx-20">
                    <button onClick={onClose} className="py-2 px-4 bg-blue-500 text-white rounded-md hover:bg-blue-600">Close</button>
                    {saveButton && <button onClick={onSave} className="py-2 px-4 bg-blue-500 text-white rounded-md hover:bg-blue-600">Save</button>}
                    </div>
                </div>
            </DraggableComponent>
            </div>
        </div>
        
    );
};

export default Modal;