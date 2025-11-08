import { Component, inject, OnInit, TemplateRef, ViewChild } from '@angular/core'
import { CottageService } from '../services/cottage.service'
import { Cottage } from '../models/cottage'
import { Reservation } from '../models/reservation'
import { FullCalendarModule } from '@fullcalendar/angular'
import { CalendarOptions } from '@fullcalendar/core'
import dayGridPlugin from '@fullcalendar/daygrid'
import interactionPlugin from '@fullcalendar/interaction'
import { FormsModule } from '@angular/forms'
import { MatDialog, MatDialogModule } from '@angular/material/dialog'
import { DatePipe } from '@angular/common'
import { MatRadioModule } from '@angular/material/radio'
import { MatSnackBar } from '@angular/material/snack-bar'
import { UserService } from '../services/user.service'
import { User } from '../models/user'

@Component({
  selector: 'app-owner-reservations',
  standalone: true,
  imports: [FormsModule, DatePipe, FullCalendarModule, MatDialogModule, MatRadioModule],
  templateUrl: './owner.reservations.component.html',
  styleUrls: ['./owner.reservations.component.css']
})

export class OwnerReservationsComponent implements OnInit {

  @ViewChild('reservationDialog') reservationDialog!: TemplateRef<any>
  private cottageService = inject(CottageService)
  private userService = inject(UserService)
  private snackBar = inject(MatSnackBar)
  myCottages: Cottage[] = []
  allUsers: User[] = []
  showProcess = false
  status = ""
  comment = ""
  cottageId = 0
  reservationId = 0
  dialog = inject(MatDialog)

  calendarOptions: CalendarOptions = {
    plugins: [dayGridPlugin, interactionPlugin],
    initialView: 'dayGridMonth',
    firstDay: 1,
    height: 'auto',
    initialDate: new Date(),
    events: [],
    eventClick: (info) => this.openReservationModal(info)
  }

  ngOnInit(): void {

    this.userService.getAll().subscribe(users => {
      if  (users) this.allUsers = users
    })

    this.cottageService.getAll().subscribe(cottages => {
      if (!cottages) return

      const loggedUser = JSON.parse(localStorage.getItem('loggedUser')!).username
      this.myCottages = cottages.filter(c => c.owner === loggedUser)

      this.myCottages.forEach(c => {
        c.reservations.sort(
          (a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
        )
      })

      this.calendarOptions.events = this.convertReservationsToEvents(this.myCottages)
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

  hasWaitingReservations(reservations: Reservation[]): boolean {
    return reservations.some(r => r.status === 'waiting')
  }

  getTourist(username: string) : string {
    return  this.allUsers.find(u => u.username === username)!.firstName + " " + 
            this.allUsers.find(u => u.username === username)!.lastName
  }

  processReservation(cId: number, rId: number, s: string, c: string) {
    if (s == "declined" && c == "") {
      this.showMessage("❌ Please enter the reason for refusal")
      return
    }
    this.cottageService.processReservation(cId, rId, s, c).subscribe(ok => {
      this.showMessage(ok)
      this.ngOnInit()
      this.showProcess = false
    })
  }

  convertReservationsToEvents(cottages: Cottage[]) {
    const events: any[] = []
    cottages.forEach(c => {
      c.reservations.forEach(r => {
        if (r.status !== 'declined') {
          const end = new Date(r.endDate)
          end.setDate(end.getDate() + 1)
          events.push({
            title: c.name,
            start: r.startDate,
            end: end,
            color: r.status === 'waiting' ? '#f6b73c' : '#00b37a',
            allDay: true,
            extendedProps: { reservationId: r.id, cottageId: c.id, status: r.status }
          })
        }
      })
    })
    return events
  }

  openReservationModal(info: any) {
    if (info.event.extendedProps.status === 'approved') return

    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur()
    }

    this.cottageId = info.event.extendedProps.cottageId
    this.reservationId = info.event.extendedProps.reservationId
    this.status = ''
    this.comment = ''

    this.dialog.open(this.reservationDialog, {
      width: '400px',
      maxWidth: '90%',
      disableClose: true,
      autoFocus: true
    })
  }

  submitDialog() {

    if (this.status === 'declined' && this.comment === '') {
      this.showMessage('❌ Please enter the reason for refusal')
      return
    }

    this.cottageService.processReservation(this.cottageId, this.reservationId, this.status, this.comment).subscribe(ok => {
      this.showMessage(ok)
      this.dialog.closeAll()
      this.ngOnInit()
    })

  }


  
}
