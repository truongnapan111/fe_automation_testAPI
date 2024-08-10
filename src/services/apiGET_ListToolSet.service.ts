import axios from 'axios';
import React from 'react';

export const fetchDataListTS = async () => {
    try {
      const res = await axios.get(`http://localhost:8080/api/v1/tooltest/listTSFunction`);
      return res.data;
    } catch (error) {
      console.error('Error fetching data', error);
      return [];
    }
  };