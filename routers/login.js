const express = require ("express")
const md5 = require('md5')
const login = express()
login.use(express.json())
const buffer = require("buffer")
if (!buffer.SlowBuffer) {
    buffer.SlowBuffer = buffer.Buffer
}
const jwt = require("jsonwebtoken")
const secretkey = process.env.JWT_SECRET || "development-secret-change-me"

const models = require('../models/index')
//const { request } = require("express")
const user = models.users;

login.post('/', async (request, response) => {
    try {
        let newLogin = {
            username : request.body.username,
            password : md5(request.body.password)
        }
        let dataUser = await user.findOne({
            where : newLogin
        });

        if(dataUser){
            const payload = {
                id_user: dataUser.id_user,
                nama: dataUser.nama,
                username: dataUser.username,
                role: dataUser.role
            }
            let token = jwt.sign(payload, secretkey)
            return response.json({
                logged: true,
                token: token,
                user: payload
            })
        }

        return response.json({
            logged: false,
            message: `Invalid username or password`
        })
    } catch (error) {
        return response.status(500).json({
            logged: false,
            message: `Unable to connect to the account service`
        })
    }
})

login.post('/register', async (request, response) => {
    const { nama, username, password } = request.body

    if (!nama || !username || !password) {
        return response.status(400).json({
            registered: false,
            message: 'Name, username, and password are required'
        })
    }

    try {
        const existingUser = await user.findOne({ where: { username } })
        if (existingUser) {
            return response.status(409).json({
                registered: false,
                message: 'That username is already in use'
            })
        }

        await user.create({
            nama,
            username,
            password: md5(password),
            role: 'Kasir'
        })

        return response.status(201).json({
            registered: true,
            message: 'Account created successfully'
        })
    } catch (error) {
        return response.status(500).json({
            registered: false,
            message: 'Unable to create the account'
        })
    }
})

// fungsi auth digunakan untuk verifikasi token yang dikirimkan
const auth = (request, response, next) => {
    // kita dapatkan data authorization
    let header = request.headers.authorization
    // header = Bearer eyJhbGciOiJIUzI1NiJ9.eyJpZF91c2VyIjo

    // kita ambil data token nya 
    let token = header && header.split(" ")[1]

    if(token == null) { 
        //jika token nya kosong
        return response.status(401).json( {
            message: `Unauthorized`
        })
    } else { 
        let jwtHeader = {
            algorithm: "HS256" // nnti diganti i guess :D
        }

        // verifikasi token yang diberikan
        jwt.verify(token, secretkey, jwtHeader, error => {
            if(error) {
                return response.status(401).json({
                    message: `Invalid Token`
                })
            }else{
                next()
            }
        })
    }
}
module.exports = { login, auth }