import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { user } from "../models/user.models.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/apiResponse.js";


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
    console.log("email :", email);
    console.log("password :", password);
    
    
    // if (fullName === "") {
    //     throw new ApiError(400,"fullname is required")
    // }

     if (
        [fullName, email, username, password].some((field) => field?.trim() === "")
    ) {
        throw new ApiError(400, "All fields are required")
    }


// checcking if username and email already exists
    const existedUser = user.findOne({
        $or : [{username},{email}] 
    })

    if(existedUser) {
        throw new ApiError (409,"username or email already exists")
    }

     
    //check for images and check for avatar
    const avatarLocalPath = req.files?.avatar[0]?.path;
    const coverImageLocalPath =  req.files?.coverImage[0]?.path;

    if (!avatarLocalPath) {
        throw new ApiError (400,"avatar file is required")
    }
    
    // now we upload images on cloudinary
    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)
    

    // checking again if avatar is uploaded or not
    if(!avatar){
        throw new ApiError(400,"avatar file is required")
    }

    // we create a object to create entry in db
     const user = user.create({
        fullName,
        avatar : avatar.url,
        coverImage : coverImage?.url || "",
        email,
        password,
        username : username.toLowerCase()
     })

      //checks if user id created or not
      const createdUser = await user.findById(user._id).select("-password -refreshToken")
        if(!createdUser){ // if user is not created then we throw error as its server error
            throw new ApiError(500,"user registration failed")
        }

        // if user is created successfully then we return response to frontend
        return res.status(201).json(
            new ApiResponse(201,createdUser,"user registered successfully")
        )

})


export {registerUser}