import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { user as User} from "../models/user.models.js"; 
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/apiResponse.js";
import jwt from "jsonwebtoken";


const generateAccessAndRefreshTokens = async (userId) => {
    try {
        const user = await User.findById(userId);
        if (!user) throw new ApiError(404, "User not found for token generation");

        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });
        return { accessToken, refreshToken };

    } catch (error) {
        throw new ApiError(500, error?.message || "something went wrong while generating tokens");
    }

}

// Register user
const registerUser = asyncHandler(async (req, res) => {
    // 1. Get user details from frontend
    const { fullName, email, username, password } = req.body;
    
    console.log("email :", email);

    // 2. Validation - Check for empty fields
    if ([fullName, email, username, password].some((field) => field?.trim() === "")) {
        throw new ApiError(400, "All fields are required");
    }

    // 3. Check if user already exists (Moved UP before creation)
    const existedUser = await User.findOne({
        $or: [{ username }, { email }]
    });

    if (existedUser) {
        throw new ApiError(409, "Username or email already exists");
    }

    // 4. Check for images (avatar is required)
    const avatarLocalPath = req.files?.avatar?.[0]?.path; // Added safe navigation ?.
    let coverImageLocalPath;
    
    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        coverImageLocalPath = req.files.coverImage[0].path;
    }

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is required");
    }

    // 5. Upload to Cloudinary (Moved UP so we have the URLs for creation)
    const avatar = await uploadOnCloudinary(avatarLocalPath);
    const coverImage = await uploadOnCloudinary(coverImageLocalPath);

    if (!avatar) {
        throw new ApiError(400, "Avatar file upload failed");
    }

    // 6. Create user object in DB (Now we have all data ready)
    const newUser = await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        username: username.toLowerCase()
    });

    // 7. Check for user creation and return response
    const createdUser = await User.findById(newUser._id).select("-password -refreshToken");

    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering the user");
    }

    return res.status(201).json(
        new ApiResponse(201, createdUser, "User registered successfully")
    );
});



//login user
const loginUser = asyncHandler(async (req,res) =>{
        // get data from request body
        // username or email can be used to login
        // find user by username or email
        // password check
        // if password is correct, generate access token and refresh token
        // return access token and refresh token in response
       // send cookie

       const {email,username,password} = req.body;
        
       if(!username && !email){
            throw new ApiError(400,"Username or email are required");
        }
        

        const user = await User.findOne({
            $or: [ {username},{email}]
        })

        if(!user) {
            throw new ApiError(404,"user not found")
        }

        const isPasswordValid = await user.isPasswordCorrect(password);

        if (!isPasswordValid) {
            throw new ApiError(401, "Invalid user credentials");
        }

        const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id)

        const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

        const options = {
            httpOnly : true,
            secure : true
        }

        return res
        .status(200)
        .cookie("accessToken" , accessToken, options)
        .cookie("refreshToken" , refreshToken, options)
        .json(
            new ApiResponse(
                200,
                {
                    user : loggedInUser,accessToken,refreshToken
                },
                "User logged in successfully"
            )
        )
})


//Logout user
const logoutUser = asyncHandler(async(req,res) =>{
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                refreshToken: undefined
            }
        },
        {
            new : true
        }
    )
    const options = {
            httpOnly : true,
            secure : true
        }

         return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new ApiResponse(200, {}, "User logged out successfully"))
})  


// creating end point for refresh access token
const refreshAccessToken = asyncHandler(async(req,res) => {

    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

    if(!incomingRefreshToken){
        throw new ApiError(401,"unauthorised req")
    }

    try {
        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        )
    
        const user = await User.findById(decodedToken?._id)
        
        if(!user){
            throw new ApiError(401,"Invalid refresh token")
        }
    
        // Check if the incoming refresh token matches the one stored in the database
        if(incomingRefreshToken !== user?.refreshToken){
            throw new ApiError(401,"refresh token is expired or used, please login again")
        }
    
        const options = {
            httpOnly : true,
            secure : true
        }
    
        const { accessToken, newRefreshToken } = await generateAccessAndRefreshTokens(user._id)
    
        return res
        .status(200)
        .cookie("accessToken" , accessToken , options)
        .cookie("refreshToken",newRefreshToken , options)
        .json(
            new ApiResponse(
                200 , 
                {accessToken,refreshToken :  newRefreshToken},
                "Access Token refreshed successfully"
            )   
        )
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid refresh token")
    }
})

const changeCurrentPassword = asyncHandler(async(req,res) => {
    const {oldPassword,newPassword} = req.body 

    const user = await User.findById(req.user?._id)
    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword)

    if(!isPasswordCorrect){
        throw new ApiError(401,"password is incorrect")
    }

    // means password is correct, we can update the password
    user.password = newPassword

    await user.save({validateBeforeSave : false})

    return res
    .status(200)
    .json(new ApiResponse(200 , {}, "Password changed successfully"))

})





export { 
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken
 };