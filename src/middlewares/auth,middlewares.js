import { asyncHandler } from "../utils/asyncHandler";


export const verifyJWT = asyncHandler(async(req,res,next) => {
    // Get the access token from the request header or cookies

    req.cookies?.accessToken || req.header("Authorization")
})
