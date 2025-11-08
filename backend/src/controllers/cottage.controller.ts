import express from 'express'
import CottageModel from '../models/cottage'

export class CottageController {

    getAll = (req: express.Request, res: express.Response) => {
    
        CottageModel.find({}).then(cottages => {
            res.json(cottages)
        }).catch(err => {
            console.log(err)
            res.json(null)
        })
    
    }

    blockTemp = (req: express.Request, res: express.Response) => {
    
        let i = req.body.id
        let d = new Date(req.body.dateAvailable);

        CottageModel.updateOne({id: i}, {dateAvailable: d}).then(() => {
            res.json("✅ Cottage successfully blocked for 48 hours")
        }).catch(err => {
            console.log(err)
            res.json("❌ Error occurred during blocking")
        })
    
    }

    rateCottage = (req: express.Request, res: express.Response) => {

        let cId = req.body.cottageId
        let rId = req.body.reservationId
        let r = req.body.rating
        let c = req.body.touristComment

        CottageModel.updateOne({id: cId}, {$set: {"reservations.$[res].rating": r, "reservations.$[res].touristComment": c}}, {arrayFilters: [{
            "res.id": rId
        }]}).then(() => {
            res.json("✅ Successfully rated this cottage")
        }).catch(err => {
            console.log(err)
            res.json("❌ Error occurred during rating")
        })

    }

    cancelReservation = (req: express.Request, res: express.Response) => {

        let cId = req.body.cottageId
        let rId = req.body.reservationId

        CottageModel.updateOne({id: cId}, {$pull: {reservations: {id: rId}}}).then(ok => {
            res.json("✅ Successfully canceled reservation")
        }).catch(err => {
            console.log(err)
            res.json("❌ Error occurred during cancelation")
        })

    }

    processReservation = (req: express.Request, res: express.Response) => {

        let cId = req.body.cottageId
        let rId = req.body.reservationId
        let s = req.body.status
        let c = req.body.declinedComment

        CottageModel.updateOne({id: cId}, {$set: {"reservations.$[res].status": s, "reservations.$[res].declinedComment": c}}, {arrayFilters: [{
            "res.id": rId
        }]}).then(() => {
            res.json("✅ Successfully processed this reservation")
        }).catch(err => {
            console.log(err)
            res.json("❌ Error occurred during processing")
        })

    }

    editCottage = (req: express.Request, res: express.Response) => {
    
        let oldCottage = JSON.parse(req.body.oldCottage)
        let edtCottage = JSON.parse(req.body.edtCottage)

        CottageModel.updateOne(oldCottage, edtCottage).then(() => {
            res.json("✅ Cottage successfully edited")
        }).catch(err => {
            console.log(err)
            res.json("❌ Error occurred during cottage edit")
        })
    
    }

    deleteCottage = (req: express.Request, res: express.Response) => {
    
        let cottageId = req.body.cottageId

        CottageModel.deleteOne({id: cottageId}).then(() => {
            res.json("✅ Cottage successfully deleted")
        }).catch(err => {
            console.log(err)
            res.json("❌ Error occurred during cottage deletion")
        })
    
    }

    registerCottage = (req: express.Request, res: express.Response) => {

        let newCottage = JSON.parse(req.body.newCottage)

        if (req.files && Array.isArray(req.files)) {
            newCottage.pictures = (req.files as Express.Multer.File[]).map(f => `/uploads/cottages/${newCottage.id}/${f.filename}`)
        }

        new CottageModel(newCottage).save()
            .then(() => res.json("✅ Cottage successfully registered"))
            .catch(err => {
                console.log(err)
                res.json("❌ Error occurred during cottage registration")
            })

    }

    addReservation = (req: express.Request, res: express.Response) => {
    
        let cottageId = req.body.cottageId
        let reservation = req.body.reservation

        CottageModel.updateOne({id: cottageId}, {$push: {reservations: reservation}}).then(() => {
            res.json("✅ Successfully added the reservation")
        }).catch(err => {
            console.log(err)
            res.json("❌ Error occurred during reservation adding")
        })
    
    }

}