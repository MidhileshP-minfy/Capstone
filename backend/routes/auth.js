import express from "express"
import {signup,login,verifyToken,getUserRole} from "../controllers/authController.js"
import { authenticateToken,requireRole } from "../middleware/authMiddleware.js"


const router=express.Router()


/**
 * @route   POST /auth/signup
 * @desc    Register a new user
 * @access  Public
 */
router.post('/signup',signup)

/**
 * @route   POST /auth/login
 * @desc    Login with Firebase ID
 * @access  Public
 */
router.post('/login',login)

/**
 * @route   GET /auth/verify-token
 * @desc    Verify Current JWT Token
 * @access  Private
 */
router.get('/verify-token',authenticateToken,verifyToken)

/**
 * @route   GET /auth/role
 * @desc    get User Role and Permissions
 * @access  Private
 */
router.get('/role',authenticateToken,getUserRole)

// /**
//  * @route   GET /auth/admin-only
//  * @desc    get Admin access
//  * @access  Private
//  */
// router.get('/admin-only',authenticateToken,requireRole['admin']),(req,res)=>{
//     res.json({
//         message:"Welcome Admin",
//         user:req.user
//     })
// }

// /**
//  * @route   GET /auth/editor-access
//  * @desc    get Editor Access
//  * @access  Private
//  */
// router.get('/editor-access',authenticateToken,requireRole['admin','editor']),(req,res)=>{
//     res.json({
//         message:"Admin or Editor Access Granted",
//         user:req.user
//     })
// }

export default router