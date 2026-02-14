import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
// RENAMED IMPORT: using 'as User' prevents name conflicts with local variables
import { user as User } from "../models/user.models.js"; 
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/apiResponse.js";


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
        
       if(!username || !email){
            throw new ApiError(400,"Username or password are required");
        }

})



export { 
    registerUser,
    loginUser
 };