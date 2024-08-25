const prisma = require('../config/db')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const { userValidator } = require('../util/userValidator')

const profile = async (req, res) => {
    try {
        const userId = parseInt(req.data.userId)

        if (!userId) {
            return res.status(400).json({ message: 'Not a Valid Token' })
        }

        const user = await prisma.user.findUnique({
            where: { id: userId },
        })

        if (!user) {
            return res.status(404).json({ message: 'No User Found' })
        }

        const { password, createdAt, ...userToSend } = user

        res.status(200).json(userToSend)
    } catch (err) {
        res.status(500).json({ message: 'Unexpected Server Error' })
    }
}

const deleteUser = async (req, res) => {
    try {
        const userId = parseInt(req.data.userId)

        if (!userId) {
            return res.status(400).json({ message: 'Not a Valid Token' })
        }

        const user = await prisma.user.findUnique({
            where: { id: userId },
        })

        if (!user) {
            return res.status(404).json({ message: 'No User Found' })
        }

        await prisma.user.delete({
            where: { id: userId },
        })

        res.status(200).json({
            message: 'User Deleted Successfully',
        })
    } catch (err) {
        res.status(500).json({ message: 'Unexpected Server Error' })
    }
}

const register = async (req, res) => {
    const { name, email, password } = req.body
    if (name && email && password) {
        try {
            await userValidator.validateAsync({ email, password })

            const hashedPass = await bcrypt.hash(
                password,
                parseInt(process.env.SALT_ROUND, 10)
            )
            await prisma.user.create({
                data: { name, email, password: hashedPass },
            })

            res.status(201).json({
                message: 'Registration Successful.',
            })
        } catch (err) {
            console.log(err)
            // joi error handling
            if (err.details && err.details[0].message) {
                res.status(400).json({ message: err.details[0].message })
            } else if (err.code === 'P2002') {
                res.status(400).json({ message: 'Email already in use' })
            } else {
                res.status(500).json({ message: 'Internal Server Error' })
            }
        }
    } else {
        res.status(400).json({ message: 'Name or Email or password missing' })
    }
}

const login = async (req, res) => {
    const { email, password } = req.body
    if (email && password) {
        try {
            const user = await prisma.user.findUnique({
                where: {
                    email,
                },
            })

            if (user) {
                const checkPass = await bcrypt.compare(password, user.password)
                if (checkPass) {
                    const token = jwt.sign(
                        { userId: user.id },
                        process.env.JWT_SECRET
                    )

                    res.status(201).json({ token })
                } else {
                    res.status(401).json({ message: 'Invalid Password' })
                }
            } else {
                res.status(404).json({
                    message: 'No User Found With These Credentials',
                })
            }
        } catch (err) {
            res.status(500).json({ message: 'Email or password missing' })
        }
    } else {
        res.status(400).json({ message: 'Email or password missing' })
    }
}

module.exports = { register, login, profile, deleteUser }
