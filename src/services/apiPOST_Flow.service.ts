import axios from 'axios';
import React from 'react';
  
export const handleSave = async (
  data: any , 
  setOpen: React.Dispatch<React.SetStateAction<boolean>>
) => {
  try {
    await axios.post(`http://localhost:8080/api/v1/tooltest/createFlow`, data);
    setOpen(false);
  } catch (error) {
    console.error('Error saving data', error);
  }
};