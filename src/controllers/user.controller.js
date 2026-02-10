import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { user } from "../models/user.models.js";

//method to register user
const registerUser = asyncHandler(async (req,res) => {
    //logic to register user
    //get user details from frontend
    //validation - not empty
    //check if user alr exist by username and email
    //check for images and check for avatar
    //upload them to cloudinary , avatar
    // create user object - create entry in db
    //remove password and refresh token field from response
    //check for user creation
    //return response

    const{fullName,email,username,password} = req.body

    // if (fullName === "") {
    //     throw new ApiError(400,"fullname is required")
    // }

     if (
        [fullName, email, username, password].some((field) => field?.trim() === "")
    ) {
        throw new ApiError(400, "All fields are required")
    }



    

 

    
    
    
})


export {registerUser}