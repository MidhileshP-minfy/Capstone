import {verifyToken} from "../utils/jwt.js"
import {db, auth} from "../config/firebase.js"

export const authenticateToken=async (req,res,next)=>{
    try{
        const authHeader=req.headers.authorization
        const token=authHeader && authHeader.split(' ')[1]

        if(!token){
            return res.status(401).json({error:"Authentication Required", code:"Token Required"})
        }

        //Decode the JWT Token
        const decoded=verifyToken(token)

        //Verify User is in DB or not
        const userRecord=await auth.getUser(decoded.uid)

        //Get User role
        const userDoc= await db.collection('users').doc(decoded.uid).get()
        const userData=userDoc.data()

        req.user={
            uid:decoded.uid,
            email:decoded.email,
            role:userData?.role || "viewer",
            displayName:userRecord.displayName,
            emailVerified:userRecord.emailVerified
        }
        next();
    }catch(error){
        console.error("Authentication Failed", error)
        return res.status(403).json({
            error:"Invalid or Expired Token",
            code:"Invalid-Token"
        })
    }
}


// Middleware to check whether the user has required permission or not
export const requireRole=(requireRoles)=>{
    return(req,res,next)=>{
        if(!req.user){
            return res.status(401).json({
                error:"Authentication Required",
                code:"Auth-Required"
            })
        }
        const userRole=req.user.role
        const roleHierarchy={
            admin:3,
            editor:2,
            viewer:1,
        }
        const hasPermission=requireRoles.some(role=>(roleHierarchy[userRole]>=roleHierarchy[role]))

        if(!hasPermission){
            return res.status(403).json({
                error:"Insufficient Permission",
                code:"Insufficient-Permission",
                required:requireRoles,
                current:userRole
            })
        }
        next();
    }
}

