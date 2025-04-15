import axios from 'axios';

const API_URL = 'http://localhost:5000/api/data';


export const fetchData = () => axios.get(API_URL);
