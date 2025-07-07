const express = require('express')
require('dotenv').config()
const cors = require('cors')
const connectDb = require('./config/db')
const { loginUser, registerUser, sendResetPasswordLink, resetPassword, logoutUser, verifyEmail, resendVerification } = require('./controllers/userController')
const { loginFundraiser, registerFundraiser } = require('./controllers/raiserConrtoller')
const app = express()

app.use(cors({
    origin: process.env.FRONTEND_URL, // Your Next.js frontend URL
    credentials: true, // Allow cookies to be sent
  }));
connectDb()
app.use(express.json())

app.post('/user/login' , loginUser);
app.post('/user/register', registerUser)
app.post('/user/logout' , logoutUser)
app.get('/user/verify-email', verifyEmail)
app.post('/user/resend-verification' , resendVerification)
app.post('/fundraiser/login' , loginFundraiser)
app.post('/fundraiser/register' , registerFundraiser)
app.post('/user/sendResetPasswordLink', sendResetPasswordLink)
app.post('/user/reset-password/:token' , resetPassword)

app.listen(5000 , (sj) => {
    console.log('App is running on port 5000')
})
