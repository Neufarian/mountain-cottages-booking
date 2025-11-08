export class Reservation {
    id = 0
    tourist = ""
    startDate: Date = new Date()
    endDate: Date = new Date()
    numAdults = 0
    numChildren = 0
    requests = ""
    status = "waiting"
    declinedComment = ""
    rating: number | null = null
    touristComment = ""
}