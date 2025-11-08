import { Coordinates } from "./coordinates"
import { Prices } from "./prices"
import { Reservation } from "./reservation"

export class Cottage {
    id = 0
    name = ""
    location = ""
    services = ""
    owner = ""
    phone = ""
    pictures: Array<string> = []
    prices: Prices = new Prices()
    coordinates: Coordinates = new Coordinates()
    reservations: Array<Reservation> = []
    dateAvailable: Date = new Date()
}