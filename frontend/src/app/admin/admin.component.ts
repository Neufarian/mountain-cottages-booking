import { Component, inject, OnInit } from '@angular/core'
import { User } from '../models/user'
import { UserService } from '../services/user.service'
import { Router, RouterLink } from '@angular/router'
import { FormsModule } from '@angular/forms'
import { Cottage } from '../models/cottage'
import { CottageService } from '../services/cottage.service'
import { CommonModule, DatePipe } from '@angular/common'
import { Reservation } from '../models/reservation'
import { MatSnackBar } from '@angular/material/snack-bar'

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [FormsModule, CommonModule, DatePipe, RouterLink],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.css'
})
export class AdminComponent implements OnInit {

  passwordRegex = /^(?=[A-Za-z])(?=(?:.*[a-z]){3,})(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9])[A-Za-z\d\S]{6,10}$/
  private userService = inject(UserService)
  private cottageService = inject(CottageService)
  private router = inject(Router)
  private snackBar = inject(MatSnackBar)
  allUsers: User[] = []
  allCottages: Cottage[] = []  
  loggedUser: User = new User()
  oldPassword = ""
  newPassword = ""
  repeatPassword = ""
  edtUser: User = new User()
  oldUser: User = new User()
  showEdit = false

  ngOnInit(): void {

    this.userService.getAll().subscribe(users => {
      if(users) this.allUsers = users.filter(u => u.type != 'admin')
    })
    this.cottageService.getAll().subscribe(cottages => {
      if(cottages) this.allCottages = cottages
    })
    this.loggedUser = JSON.parse(localStorage.getItem("loggedUser")!)

  }

  showMessage(msg: string) {
    this.snackBar.open(msg, 'Close', {
      duration: 3000,
      panelClass: ['error-snackbar'],
      horizontalPosition: 'center',
      verticalPosition: 'top',
    })
  }

  changePassword() {

    if(!this.passwordRegex.test(this.newPassword)) { this.showMessage("❌ New password does not fulfill all requirements"); return }
    if(this.newPassword != this.repeatPassword) { this.showMessage("❌ Non-matching new passwords"); return }
    
    this.userService.changePassword(this.loggedUser, this.oldPassword, this.newPassword).subscribe({
      next: () => {
        this.router.navigate(['hidden'])
      },
      error: (err) => {
        if(err.status == 400) {
            this.showMessage('❌ Error occurred during password change')
          } else if(err.status == 401) {
            this.showMessage('❌ Please enter the correct old password')
          } else if(err.status == 403) {
            this.showMessage('❌ New password must differ from the old one')
          }
        }
    })

  }

  changeStatus(u: string, s: string) {

    this.userService.changeStatus(u, s).subscribe(ok => {
      this.showMessage(ok)
      if(ok) {
        this.userService.getAll().subscribe(users => {
          if(users) this.allUsers = users.filter(u => u.type != 'admin')
        })
      }
    })

  }

  startEdit(user: User) {

    this.oldUser = JSON.parse(JSON.stringify(user))
    this.edtUser = JSON.parse(JSON.stringify(user))
    this.showEdit = true

  }

  editUser() {
    
    if (!this.edtUser.firstName || !this.edtUser.lastName ||
        !this.edtUser.address || !this.edtUser.email ||
        !this.edtUser.phone || !this.edtUser.creditCard) {
      this.showMessage("❌ You must fill in all the fields")
      return
    }

    if (JSON.stringify(this.edtUser) === JSON.stringify(this.oldUser)) { 
      this.showEdit = false
      return 
    } 
    if (this.allUsers.some(user => user.username == this.edtUser.username && user.username != this.oldUser.username)) {
      this.showMessage("❌ Username taken")
      return
    }
    if (this.allUsers.some(user => user.email == this.edtUser.email && user.email != this.oldUser.email)) {
      this.showMessage("❌ An account with that email already exists")
      return
    }

    const formData = new FormData()
    formData.append('user', JSON.stringify(this.oldUser)) 
    formData.append('edtUser', JSON.stringify(this.edtUser))

    this.userService.editUser(formData).subscribe(ok => {
      this.showMessage(ok)
      this.userService.getAll().subscribe(users => {
        if(users) this.allUsers = users.filter(u => u.type != 'admin')
        this.showEdit = false
      })
    })

  }

  avgRating(reservations: Reservation[]): number {

    reservations = reservations.filter(r => r.rating !== null)
    if (reservations.length == 0) return 0
    let sum = 0
    reservations.forEach(r => {
        sum += r.rating!
    })
    return sum / reservations.length

  }

  poorRating(reservations: Reservation[]) : boolean {

    reservations = reservations.filter(r => r.rating !== null)
    if(reservations.length < 3) return false
    for(let i = reservations.length; i > reservations.length - 3; i--) {
      if(reservations[i - 1].rating != 1) return false
    }
    return true

  }

  blockTemp(cottage: Cottage) {

    const date = new Date(Date.now())
    date.setHours(date.getHours() + 48)
    this.cottageService.blockTemp(cottage.id, date).subscribe(ok => {
      this.showMessage(ok)
      if(ok) {
        this.cottageService.getAll().subscribe(cottages => {
          if(cottages) this.allCottages = cottages
        }) 
      }
    })

  }

  isBlocked(dateAvailable: Date) : boolean {

    let today = new Date(Date.now())
    return new Date(dateAvailable).getTime() >= today.getTime()

  }

  getOwner(username: string) : string {
    return  this.allUsers.find(u => u.username === username)!.firstName + " " + 
            this.allUsers.find(u => u.username === username)!.lastName
  }

  deleteUser(u: string) {

    this.userService.deleteUser(u).subscribe(ok => {
      this.showMessage(ok)
      if(ok) {
        this.userService.getAll().subscribe(users => {
          if(users) this.allUsers = users.filter(u => u.type != 'admin')
        })
      }
    })

  }

}
