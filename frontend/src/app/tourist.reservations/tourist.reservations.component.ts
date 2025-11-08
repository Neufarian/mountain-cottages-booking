import { Component, inject, OnInit } from '@angular/core';
import { CottageService } from '../services/cottage.service';
import { Cottage } from '../models/cottage';
import { Reservation } from '../models/reservation';
import { User } from '../models/user';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-tourist.reservations',
  standalone: true,
  imports: [DatePipe, FormsModule],
  templateUrl: './tourist.reservations.component.html',
  styleUrl: './tourist.reservations.component.css'
})
export class TouristReservationsComponent implements OnInit {
  
  private cottageService = inject(CottageService)
  private snackBar = inject(MatSnackBar)
  loggedUser: User = new User()
  allCottages: Cottage[] = []
  currentReservations: { cottage: Cottage, reservation: Reservation }[] = []
  previousReservations: { cottage: Cottage, reservation: Reservation }[] = []
  today: Date = new Date()
  showRate = false
  stars = [1, 2, 3, 4, 5]
  rating = 0
  hovered = 0
  comment = ""
  cottageId = 0
  reservationId = 0

  ngOnInit(): void {
    this.loggedUser = JSON.parse(localStorage.getItem("loggedUser")!)

    this.cottageService.getAll().subscribe(cottages => {
      if (cottages) {
        this.allCottages = cottages.map(c => ({
          ...c,
          reservations: [...c.reservations
            .filter(r => r.tourist === this.loggedUser.username)
          ]
        }))
        .filter(c => c.reservations.length > 0)

        this.currentReservations = []
        this.previousReservations = []

        this.allCottages.forEach(c => {
          c.reservations.forEach(r => {
            const resObj = { cottage: { ...c }, reservation: { ...r } }
            if (r.status === 'waiting') {
              this.currentReservations.push(resObj)
            } else if (this.isPastReservation(r)) {
              this.previousReservations.push(resObj)
            }
          })
        })

        this.currentReservations.sort((a, b) =>
          new Date(b.reservation.startDate).getTime() - new Date(a.reservation.startDate).getTime()
        )

        this.previousReservations.sort((a, b) =>
          new Date(b.reservation.startDate).getTime() - new Date(a.reservation.startDate).getTime()
        )

      }
    })

  }

  showMessage(msg: string) {
    this.snackBar.open(msg, 'Close', {
      duration: 3000,
      panelClass: ['error-snackbar'],
      horizontalPosition: 'center',
      verticalPosition: 'top',
    })
  }

  isPastReservation(reservation: any): boolean {
    const today = new Date()
    return reservation.status === 'approved' && new Date(reservation.endDate) < today
  }

  getStarImage(index: number): string {
    if (this.hovered >= index + 1 || this.rating >= index + 1) {
      return 'images/stars/fullStar.png'
    }
    return 'images/stars/emptyStar.png'
  }

  hoverRating(star: number) {
    this.hovered = star
  }

  setRating(star: number) {
    this.rating = star
  }

  rateCottage(cId: number, rId: number, r: number, c: string) {
    if (!this.rating) {
      this.showMessage("❌ Please leave a rate using stars")
      return
    }
    this.cottageService.rateCottage(cId, rId, r - 1, c).subscribe(ok => {
      this.showMessage(ok)
      this.ngOnInit()
      this.showRate = false
    })
  }

  isCancelable(reservation: Reservation): boolean {
    const today = new Date()
    const cancelDeadline = new Date(reservation.startDate)
    cancelDeadline.setDate(cancelDeadline.getDate() - 1)

    return today <= cancelDeadline
  }

  cancelReservation(cId: number, rId: number) {
    this.cottageService.cancelReservation(cId, rId).subscribe(ok => {
      this.showMessage(ok)
      this.ngOnInit()
    })
  }

}
