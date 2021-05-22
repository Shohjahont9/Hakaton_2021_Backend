const { Pool } = require("pg");
const config = require("./config")
const axios = require("axios").default;

console.log([
    { saw: "SAW1", type: "пружина", remained: 253.45, life_time: 4100, articul: "DFG535D" },
    { saw: "SAW2", type: "масло", remained: 365, life_time: 1700, articul: "DFG535D" },
    { saw: "SAW1", type: "пружина", remained: 432, life_time: 3300, articul: "DFG535D" },
    { saw: "SAW2", type: "поршень", remained: 1610, life_time: 8520, articul: "DFG535D" },
    { saw: "SAW1", type: "пружина", remained: 643, life_time: 4100, articul: "DFG535D" },
    { saw: "SAW2", type: "ролики", remained: 777, life_time: 993, articul: "DFG535D" },
    { saw: "SAW1", type: "пружина", remained: 253.45, life_time: 4100, articul: "DFG535D" },
    { saw: "SAW2", type: "масло", remained: 365, life_time: 1700, articul: "DFG535D" },
    { saw: "SAW1", type: "пружина", remained: 253.45, life_time: 4100, articul: "DFG535D" },
    { saw: "SAW2", type: "масло", remained: 365, life_time: 1700, articul: "DFG535D" },
    { saw: "SAW1", type: "пружина", remained: 253.45, life_time: 4100, articul: "DFG535D" },
    { saw: "SAW2", type: "масло", remained: 365, life_time: 1700, articul: "DFG535D" },
].sort((a, b) => {
    return (a.remained/a.life_time) - (b.remained/b.life_time)
}))