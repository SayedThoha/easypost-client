export interface userRegister{
    firstname:string,
    lastname:string,
    email:string,
    password:string
}
export interface userLogin{
    email:string,
    password:string
}

export interface httpResponseModel{
    email?:string,
    message:string,
    error:string
}
export interface loginHttpResponseModel{
    message:string,
    error:string,
    accessToken:string,
    accessedUser:string,
    refreshToken:string
}
export interface verifyOtp{
    newEmail?:string,
    email:string,
    otp:number
    isForgotPassword?:boolean,
}

export interface blogData{
    userId:string|null,
    _id?:string,
    topic:string,
    otherTopic?:string,
    title:string,
    content:string,
    image:string
}

export interface blogResponse{
    userId: {
        _id:string,
        firstname: string,
        lastname: string,
        email: string,
    },
    _id:string,
    topic: string,
    title: string,
    content: string,
    image: string,
    createdAt: Date,
    updatedAt: Date
}

export interface profileData{
    _id:string,
    profilePicture:string
}

export interface userDetails{
    _id?:string,
    firstname?:string,
    lastname?:string,
    email?:string,
    profilePicture?:string
}

export interface newPassword{
    password:string,
    email:string
}