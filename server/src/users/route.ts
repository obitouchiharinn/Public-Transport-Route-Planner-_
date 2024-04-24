import express from "express";
import {databaseErrorHandler, loginErrorHandler, queries} from "../database";
import {Empty} from "../types";
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
const SECRET_KEY = process.env["SECRET_KEY"] || "default_secret_key"
const router = express.Router();

router.post("/users/register", databaseErrorHandler<Empty, Empty, {name: string, email: string, password: string}>(async (req, res) => {
    const name = req.body.name;
    const email = req.body.email;
    const password = req.body.password;
    const users = await queries.getUser(email);
    if (typeof email !== "string"){
        return res.status(400).json({error:"Invalid email"});
    }
    if (!email || email.trim() === "") {
        return res.status(400).json({error:"Email required"}); 
    }
    if (typeof name !== "string"){
        return res.status(400).json({error:"invalid name"});
    }
    if (!name || name.trim() === "") {
        return res.status(400).json({error:"Name required"}); 
    }
    if (typeof password !== "string"){
        return res.status(400).json({error:"invalid password"});
    }
    if (!password || password.trim() === "") {
        return res.status(400).json({error:"Password required"}); 
    }

    if (users.length != 0){ //check if any other user has that email
        return res.status(400).json({error:"Email is already associated with an account"});
    }
    try{
        const hash = await bcrypt.hash(password, 10);
        const result = await queries.addUser(name,email,hash);
        return res.status(200).send("Account succussfully added")
        // const token = jwt.sign({email: email}, SECRET_KEY);
        // return res.status(200).json({token: token})

    }
    catch(err: any){
        console.log(`error: ${err}`)
        return res.status(err).json({error: "Server error",});
    }
}));
router.post("/users/login", databaseErrorHandler<Empty, Empty, {email:string, password:string }>(async(req,res)=>{
    // console.log(req.body)
    const email = req.body.email;
    const password = req.body.password;
    if (typeof email !== "string"){
        return res.status(400).json({error:"Invalid email"});
    }
    if (!email || email.trim() === "") {
        return res.status(400).json({error:"Email required"}); 
    }
    if (typeof password !== "string"){
        return res.status(400).json({error:"invalid password"});
    }
    if (!password || password.trim() === "") {
        return res.status(400).json({error:"Password required"}); 
    }
    //check if user exists
    const users = await queries.getUser(email);
    if( users.length == 0){
        return res.status(400).json({error: `User ${email} not registered`});
    }
    try{
        const match = await bcrypt.compare(password, users[0].password);
        if( match === true){
            //check password
            const token = jwt.sign({email:users[0].email}, SECRET_KEY, {expiresIn:"24h"});
            return res.status(200).json({
                message: "User signed in",
                token: token 
            });
        }
        else {
            return res.status(400).json({
               error: "Incorrect Password" 
            });
        }
    }
    catch(err:any){
        return res.status(err).json({error:"Server Error"})
    }
    
}));
//protected endpoint
router.get("/users/profile", loginErrorHandler<Empty, Empty,Empty>(async (req, res, email) =>{
    const users = await queries.getUser(email);
    const thisUser = { email:users[0].email, name:users[0].name, user_id:users[0].user_id};
    return res.status(200).json(thisUser);
}))

export default router;
