import mongoose ,{Schema} from "mongoose";
import jsonwebtoken from "jsonwebtoken";
import bcrypt from "bcrypt";


const userSchema = new mongoose.Schema(
    {
           username : {
                type : String,
                required : true,
                lowercase : true,
                unique : true,
                trim : true,
                index : true
           },
           
           email : {
                type : String,
                required : true,
                lowercase : true,
                unique : true,
                trim : true,
           },

           fullName : {
                type : String,
                required : true,
                trim : true,
                index : true,
           },

           avatar : {
                type : String, // cloudinary url for image
                required : true
           },

           coverImage : {
                type : String, // cloudinary url for image
           },

           watchHistory : [
                {
                    type : Schema.Types.ObjectId,
                    ref : "video"
                }
           ],

           password : {
                type : String,
                required : [true , "Password is required"],
           },

           refreshToken : {
               type : String,
           }
    }
,{timestamps : true})

// to encrypt the  password
userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return

    this.password = bcrypt.hash(this.password,10)
    next()  
})

// to check if the pass is correct or not
userSchema.methods.isPasswordCorrect = async function (passwprd) {
   return await bcrypt.compare(passwprd,this.password)
}



userSchema.methods.generateAcessToken = function(){
    return jwt.sign(
        {
            _id : this._id,
            email : this.email,
            username : this.username,
            fullName : this.fullName
        },
        process.env.ACCESS_TOKEN_SECRET,{
            expriresIn : process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}
 
userSchema.methods.generateRefreshToken = function(){
    return jwt.sign(
        {
            _id : this._id,
        },
        process.env.REFRESH_TOKEN_SECRET,{
            expriresIn : process.env.REFRESH_TOKEN_EXPIRY
        }
    )
} 

export const user = mongoose.model("user" , userSchema)