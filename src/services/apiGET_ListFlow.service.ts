import axios from 'axios';
import React from 'react';
import { DataList } from '../model/flows/flows.model';

export const fetchData = async (setData: React.Dispatch<React.SetStateAction<DataList[]>>) => {
  try {
    const res = await axios.get<DataList[]>(`http://localhost:8080/api/v1/tooltest/listFlows`);
    let data = res.data;
    setData(data.filter(i => i.deleted === "0"));
  } catch (error) {
    console.log('ERROR', error);
  }
};

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
