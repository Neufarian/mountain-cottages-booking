import express from 'express'
import { CottageController } from '../controllers/cottage.controller'
import { uploadCottage } from '../upload'

const cottageRouter = express.Router()

cottageRouter.route('/getAll').get(
    (req, res) => new CottageController().getAll(req, res)
)

cottageRouter.route('/blockTemp').post(
    (req, res) => new CottageController().blockTemp(req, res)
)

cottageRouter.route('/rateCottage').post(
    (req, res) => new CottageController().rateCottage(req, res)
)

cottageRouter.route('/cancelReservation').post(
    (req, res) => new CottageController().cancelReservation(req, res)
)

cottageRouter.route('/processReservation').post(
    (req, res) => new CottageController().processReservation(req, res)
)

cottageRouter.route('/editCottage').post(
    uploadCottage.none(),
    (req, res) => new CottageController().editCottage(req, res)
)

cottageRouter.route('/deleteCottage').post(
    (req, res) => new CottageController().deleteCottage(req, res)
)

cottageRouter.route('/registerCottage').post(
  uploadCottage.array('pictures'), 
  (req, res) => new CottageController().registerCottage(req, res)
)

cottageRouter.route('/addReservation').post(
    (req, res) => new CottageController().addReservation(req, res)
)

export default cottageRouter
