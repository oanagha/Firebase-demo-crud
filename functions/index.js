/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

// const {onRequest} = require("firebase-functions/v2/https");
// const logger = require("firebase-functions/logger");

// Create and deploy your first functions
// https://firebase.google.com/docs/functions/get-started

// exports.helloWorld = onRequest((request, response) => {
//   logger.info("Hello logs!", {structuredData: true});
//   response.send("<h1>Hello from Firebase!</h1>");
// });
 const functions = require("firebase-functions");
 const express = require("express");
 const cors = require("cors");

 const app = express();

 const admin = require("firebase-admin");
 admin.initializeApp();

 const db = admin.firestore();

 app.use(cors({ origin: true }));
 app.use(express.json());

// app.get("/test", (req, res) => {
//     res.status(200).json({ message: "GET request successful!", query: req.query });
// });

// app.post("/test", (req, res) => {
//     const data = req.body;
//     if (!data) {
//         return res.status(400).json({ error: "No data received!" });
//     }
//     res.status(200).json({ message: "POST request successful!", receivedData: data });
// });

  app.post("/addProduct", async (req, res) => {
    try {
        const productData = req.body;

        if (!productData) {
            return res.status(401).json({ error: "Invalid product data!" });
        }
        const newProductRef = await db.collection("products").add(productData);
        res.status(201).json({ message: "Product  successfully added!", productId: newProductRef.id });
    } catch (error) {
        res.status(400).json({ error: error.message })
    } 
 });
 app.get("/getProduct", async (req, res) => {
    try {
        const productRef = await db.collection("products").get();
        const document=productRef.docs.map((docs)=>(
            {id:docs.id,...docs.data()}
        ))
        res.status(200).json({ document });
    } catch (error) {
        res.status(500).json({ error: error.message });
    } 
 });



  app.put("/updateProduct/:id", async (req, res) => {
    try {
        const productId = req.params.id; 
        const updates = req.body; 

        if (!productId || !updates) {
            return res.status(400).json({ error: "Missing product ID or update data!" });
        }
        const productRef = db.collection("products").doc(productId);
        const productSnap = await productRef.get();
        if (!productSnap.exists) {
            return res.status(404).json({ error: "Product not found!" });
        } 
        await productRef.update(updates);
        res.status(200).json({ message: "Product  successfully updated!",updates });
    } catch (error) {
        res.status(500).json({ error: error.message });
    } 
 });


 app.delete("/deleteProduct/:id", async (req, res) => {
    try {
        const productId = req.params.id; 

        if (!productId) {
            return res.status(400).json({ error: "Missing product ID!" });
        }
        const productRef = db.collection("products").doc(productId);
        const productSnap = await productRef.get();

        if (!productSnap.exists) {
            return res.status(404).json({ error: "Product not found!" });
        } 
       
        await productRef.delete(); 
        res.status(200).json({ message: "Product deleted successfully!" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
 });                                                                                                                                                                                     

 exports.api = functions.https.onRequest(app);
