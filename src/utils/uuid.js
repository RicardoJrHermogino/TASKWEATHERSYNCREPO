import { v4 as uuidv4 } from 'uuid';

const getOrCreateUUID = () => {
  if (typeof window !== 'undefined') {  // Ensure this is running in the browser
    let uuid = localStorage.getItem('user_uuid');
    
    if (!uuid) {
      uuid = uuidv4(); // Generate a new UUID
      localStorage.setItem('user_uuid', uuid); // Store it in localStorage
    }
    
    return uuid; // Return the existing or new UUID
  }

  return null; // Return null if it's being run on the server
};

export default getOrCreateUUID;
