import { Component, inject, OnInit } from '@angular/core';
import { User } from '../models/user';
import { FormsModule } from '@angular/forms';
import { UserService } from '../services/user.service';
import { Router, RouterLink, RouterModule } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-tourist',
  standalone: true,
  imports: [FormsModule, RouterLink, RouterModule],
  templateUrl: './tourist.component.html',
  styleUrl: './tourist.component.css'
})
export class TouristComponent implements OnInit {

  passwordRegex = /^(?=[A-Za-z])(?=(?:.*[a-z]){3,})(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9])[A-Za-z\d\S]{6,10}$/
  private userService = inject(UserService)
  private snackBar = inject(MatSnackBar)
  private router = inject(Router)
  loggedUser: User = new User()
  oldPassword = ""
  newPassword = ""
  repeatPassword = ""

  ngOnInit(): void {
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

    if(!this.passwordRegex.test(this.newPassword)) { this.showMessage("New password does not fulfill all requirements"); return }
    if(this.newPassword != this.repeatPassword) { this.showMessage("Non-matching new passwords"); return }
    
    this.userService.changePassword(this.loggedUser, this.oldPassword, this.newPassword).subscribe({
      next: () => {
        this.router.navigate([''])
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

}
