import axios from 'axios';
import React from 'react';
import { DataList } from '../model/flows/flows.model';

export const handleDeleteConfirmed = async (
  flowUuid: string | null,
  setData: React.Dispatch<React.SetStateAction<DataList[]>>,
  data: DataList[]
) => {
  try {
    await axios.delete(`http://localhost:8080/api/v1/tooltest/deleteFlow/${flowUuid}`);
    setData(data.filter(item => item.flowUuid !== flowUuid));
  } catch (error) {
    console.error('Error deleting item:', error);
  }
};
