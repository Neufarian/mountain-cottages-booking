import multer from 'multer'
import path from 'path'
import fs from 'fs'

const uploadFolder = path.join(__dirname, '../uploads')

if (!fs.existsSync(uploadFolder)) {
  fs.mkdirSync(uploadFolder, { recursive: true })
}

export const userStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const username = JSON.parse(req.body.user).username
    const userFolder = path.join(uploadFolder, 'users', username)
    if (!fs.existsSync(userFolder)) fs.mkdirSync(userFolder, { recursive: true })
    cb(null, userFolder)
  },
  filename: (req, file, cb) => {
    cb(null, 'profile' + path.extname(file.originalname))
  }
})

export const cottageStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const cottageId = JSON.parse(req.body.newCottage).id
    const cottageFolder = path.join(uploadFolder, 'cottages', cottageId.toString())
    if (!fs.existsSync(cottageFolder)) fs.mkdirSync(cottageFolder, { recursive: true })
    cb(null, cottageFolder)
  },
  filename: (req, file, cb) => {
    const cottageId = JSON.parse(req.body.newCottage).id
    const cottageFolder = path.join(uploadFolder, 'cottages', cottageId.toString())

    const existingFiles = fs.readdirSync(cottageFolder)
    const imageNumber = existingFiles.length + 1

    const ext = path.extname(file.originalname)
    const fileName = `image${imageNumber}${ext}`
    cb(null, fileName)
  }

})

export const uploadUser = multer({ storage: userStorage })
export const uploadCottage = multer({ storage: cottageStorage })
