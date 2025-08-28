import axios from "axios";
// Для девайса в одній мережі заміни localhost на IP комп'ютера: http://192.168.x.x:3000
export const api = axios.create({ baseURL: "http://localhost:3000" });
