import mongoose, { Schema } from "mongoose";

const subscriptionSchema = new Schema({
    subscriber : {
        type : Schema.Types.ObjectId, // one whos subscribing
        ref : "user",
    },
    channel : {
        type : Schema.Types.ObjectId, // one whos channel is being subscribed to
        ref : "user",
    },
},{timestamps : true})


export const Subscription = mongoose.model("Subscription",subscriptionSchema)