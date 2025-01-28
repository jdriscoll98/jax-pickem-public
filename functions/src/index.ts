import { initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
const app = initializeApp();
const db = getFirestore(); 
export { db };
export * from "./oncalls";
export * from "./schedules";
export * from "./triggers";
export * from "./tasks";
