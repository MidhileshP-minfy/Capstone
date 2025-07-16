import {generateToken} from "../utils/jwt.js"
import {db, auth} from "../config/firebase.js"


export const signup=async(req,res)=>{
    try{
        const {email,password,displayName,role="viewer"}=req.body

        if(!email || !password){
            return res.status(400).json({
                error:"Email and Pssword Required",
                code:"Validation-Error"
            })
        }

        const validRoles=["admin","editor","viewer"]
        if(!validRoles.includes(role)){
            return res.status(400).json({
                error:"Invalid Role",
                code:"Invalid-Role"
            })
        }

        //Create User in Firebase Auth

        const userRecord=await auth.createUser({
            email, password, displayName, emailVerified:false
        })

        await auth.setCustomerClaims(userRecord.uid, {role})

        await db.collection('users').doc(userRecord.uid).set({email, displayName, role, createdAt:new Date(), lastLogin:null})

        //Generate Token
        const token= generateToken({uid:userRecord.uid, email:userRecord.email,role})

        res.status(201).json({
            message:"User Registered Successfully",
            user:{
                uid:userRecord.uid,
                email:userRecord.email,
                displayName:userRecord.displayName,
                role, emailVerified:userRecord.emailVerified
            }, token
        })
    } catch(error){
        console.error("Registration Error", error)
        if(error.code==='auth/email-already-exists'){
            return res.status(409).json({
                error:"Email already Registered",
                code:"Email-Exists"
            })
        }
        if(error.code==='auth/invalid-email'){
            return res.status(400).json({
                error:"Invalid Email Format",
                code:"Invalid-Email"
            })
        }
        if(error.code==='auth/weak-password'){
            return res.status(400).json({
                error:"Password must be atleast 6 letters",
                code:"Email-Exists"
            })
        }
        return res.status(500).json({
                error:"Registration Failed",
                code:"Registration-Error"
            })
    }
}

export const login=async(req,res)=>{
    try{
        const {idToken}=req.body

        if(!idToken){
            return res.status(400).json({
                error:"Firebase ID Token is required",
                code:"Token-Required"
            })
        }

        const decodedToken=await auth.verifyIdToken(idToken)

        const {uid,email}=decodedToken

        const userDoc=await db.collection('users').doc(uid).get()

        if(!userDoc){
            return res.status(400).json({
                error:"User doesn't Exist",
                code:"User-Not-Found"
            })
        }

        const userData=userDoc.data()
        const userRecord=await auth.getUser(uid)

        //Update Last Login
        await db.collection('users').doc(uid).update({
            lastLogin: new Date()
        })

        const token=generateToken({
            uid,email,role:userData.role
        })

        res.json({
            message:"Login Successful",
            user:{
                uid,email,displayName:userRecord.displayName,role:userData.role,emailVerified:userRecord.emailVerified,
                lastLogin:new Date()
            }, token
        })
    }catch(error){
        console.error("Login Error",error)

        if(error.code==='auth/id-token-expired'){
            return res.status(401).json({
                error:"Token Expired",
                code:"Token-Expired"
            })
        }
        if(error.code==='auth/invalid-id-token'){
            return res.status(401).json({
                error:"Invalid Token",
                code:"Invalid-Token"
            })
        }

        return res.status(500).json({
                error:"Login Failed",
                code:"Login-Error"
            })
    }
}

export const verifyToken=async (req,res)=>{
    try{
        res.json({
            message:"Token is Valid",
            user:req.user,
            isAuthenticated:true
        })
    }catch(error){
        console.error("Token Verification Error",error)
        res.status(500).json({
            error:"Token Verification Failed",
            code:"Verification-Error"
        })
    }
}

export const getUserRole=async (req,res)=>{
    try{
        const {uid}=req.user;

        //Updated User Data
        const userDoc=await db.collection('users').doc(uid).get()
        const userData=userDoc.date()

        //Custom Claims from Firebase
        const userRecord=await auth.getUser(uid)
        const customClaims=userRecord.customClaims || {}

        res.json({
            role:userData?.role || 'viewer',
            customClaims,
            permissions:{
                canRead:true,
                canWrite:['admin','editor'].includes(userData?.role),
                canAdmin:userData?.role==='admin'
            }
        })
    }catch(error){
        console.error("Get User Role Error", error)
        res.status(500).json({
            error:"Failed to fetch User Role",
            code:"Role-Error"
        })
    }
}