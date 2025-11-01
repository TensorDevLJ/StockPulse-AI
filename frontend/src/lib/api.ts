import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL;


export async function getLatestStock(symbol: string) {
  const res = await axios.get(`${BASE_URL}/latest/${symbol}`);
  return res.data;
}

export async function getPrediction(symbol: string) {
  const res = await axios.get(`${BASE_URL}/predict/${symbol}`);
  return res.data;
}
