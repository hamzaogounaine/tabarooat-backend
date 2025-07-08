const express = require('express')
require('dotenv').config()
const cors = require('cors')
const connectDb = require('./config/db')
const { loginUser, registerUser, sendResetPasswordLink, resetPassword, logoutUser, verifyEmail, resendVerification } = require('./controllers/userController')
const { loginFundraiser, registerFundraiser } = require('./controllers/raiserConrtoller')
const { limitLoginMiddleware } = require('./middlewares/loginMiddleware')
const app = express()

const corsOptions = {
  origin: process.env.FRONTEND_URL, 
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE', //
  credentials: true, 
  optionsSuccessStatus: 204 
};
app.use(cors(corsOptions));

app.use(express.json()); 


connectDb()
app.use(express.json())

app.post('/user/login' ,limitLoginMiddleware, loginUser);
app.post('/user/register', registerUser)
app.post('/user/logout' , logoutUser)
app.get('/user/verify-email', verifyEmail)
app.post('/user/resend-verification' , resendVerification)
app.post('/fundraiser/login' , loginFundraiser)
app.post('/fundraiser/register' , registerFundraiser)
app.post('/user/sendResetPasswordLink', sendResetPasswordLink)
app.post('/user/reset-password/:token' , resetPassword)

const PORT = process.env.PORT || 5000; 

app.listen(PORT , () => {
    console.log('App is running on port 5000')
})
