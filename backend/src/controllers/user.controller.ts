import express from 'express'
import UserModel from '../models/user'
import argon2 from 'argon2'

export class UserController {

    getAll = (req: express.Request, res: express.Response) => {

        UserModel.find({}).then(users => {
            res.json(users)
        }).catch(err => {
            console.log(err)
            res.json(null)
        })

    }

    login = (req: express.Request, res: express.Response) => {

        let u = req.body.username
        let p = req.body.password

        UserModel.findOne({username: u}).then(async user => {
            if(user!.status! == "waiting") res.status(401).json(null)
            else if(user!.status! == "declined") res.status(403).json(null)
            else if(await argon2.verify(user!.password!, p)) res.status(200).json(user)
            else res.status(400).json(null)
        }).catch(err => {
            console.log(err)
            res.status(400).json(null)
        })

    }

    register = async (req: express.Request, res: express.Response) => {

        let user = JSON.parse(req.body.user)
        if (req.file) {
            user.profileImage = `/uploads/users/${user.username}/${req.file.filename}`
        } else {
            user.profileImage = `/uploads/defaultProfileImage.jpg`
        }
        user.password = await argon2.hash(user.password)

        new UserModel(user).save().then(() => {
            res.json("✅ User successfully registered")
        }).catch(err => {
            console.log(err)
            res.json("❌ Error occurred during registration")
        })

    }

    changePassword = async (req: express.Request, res: express.Response) => {

        let u = req.body.user
        let oldPass = req.body.oldPassword
        let newPass = req.body.newPassword


        if(await argon2.verify(u.password, oldPass)) {
            if (await argon2.verify(u.password, newPass)) {
                res.status(403).json(null)
            } 
            else {
                UserModel.updateOne(u, { password: await argon2.hash(newPass) }).then(() => {
                    res.status(200).json(null)
                }).catch(err => {
                    console.log(err)
                    res.status(400).json(null)
                })
            }
        } else {
            res.status(401).json(null)
        }

    }

    changeStatus = (req: express.Request, res: express.Response) => {

        let u = req.body.username
        let s = req.body.status

        UserModel.updateOne({username: u}, {status: s}).then(() => {
            res.json("✅ Status successfully changed")
        }).catch(err => {
            console.log(err)
            res.json("❌ Error occurred during status change")
        })

    }

    editUser = (req: express.Request, res: express.Response) => {

        let oldUser = JSON.parse(req.body.user)
        let edtUser = JSON.parse(req.body.edtUser)
        
        if (req.file) {
            edtUser.profileImage = `/uploads/users/${edtUser.username}/${req.file.filename}`
        } else {
            edtUser.profileImage = `/uploads/defaultProfileImage.jpg`
        }

        UserModel.updateOne(oldUser, edtUser).then(() => {
            res.json("✅ User successfully edited")
        }).catch(err => {
            console.log(err)
            res.json("❌ Error occurred during user edit")
        })

    }

    deleteUser = (req: express.Request, res: express.Response) => {
        
        let u = req.body.username
        UserModel.deleteOne({username: u}).then(() => {
            res.json("✅ User successfully deleted")
        }).catch(err => {
            console.log(err)
            res.json("❌ Error occurred during user deletion")
        })

    }

}