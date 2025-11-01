import axios from "axios";

const BASE_URL = "http://127.0.0.1:8000";

export async function getLatestStock(symbol: string) {
  const res = await axios.get(`${BASE_URL}/latest/${symbol}`);
  return res.data;
}

export async function getPrediction(symbol: string) {
  const res = await axios.get(`${BASE_URL}/predict/${symbol}`);
  return res.data;
}
