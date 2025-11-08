import { Component, OnInit, inject } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { User } from '../models/user'
import { UserService } from '../services/user.service'
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-tourist-profile',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './tourist.profile.component.html',
  styleUrl: './tourist.profile.component.css'
})
export class TouristProfileComponent implements OnInit {

  private userService = inject(UserService)
  private snackBar = inject(MatSnackBar)
  user: User = new User()         
  originalUser: User = new User()
  allUsers: User[] = []
  profileImage: File | null = null
  editing = false

  ngOnInit(): void {
    const stored = localStorage.getItem("loggedUser")
    if (stored) {
      this.user = JSON.parse(stored)
      this.originalUser = JSON.parse(stored)
    }

    this.userService.getAll().subscribe(users => {
      if (users) this.allUsers = users
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

  editUser(): void {
    if (!this.user.firstName || !this.user.lastName ||
        !this.user.address || !this.user.email ||
        !this.user.phone || !this.user.creditCard) {
      this.showMessage("❌ You must fill in all the fields")
      return
    }

    if (JSON.stringify(this.user) === JSON.stringify(this.originalUser) && !this.profileImage) {
      this.editing = false;
      return;
    }

    if (this.allUsers.some(u => u.email === this.user.email && u.username !== this.user.username)) {
      this.showMessage("❌ An account with that email already exists")
      return
    }

    const formData = new FormData()
    formData.append('user', JSON.stringify(this.originalUser))
    formData.append('edtUser', JSON.stringify(this.user))
    if (this.profileImage) formData.append('profileImage', this.profileImage)

    this.userService.editUser(formData).subscribe(msg => {
      this.showMessage(msg)
      this.userService.getAll().subscribe(users => {
        this.allUsers = users
        const updated = users.find(u => u.username === this.user.username)
        if (updated) {
          this.user = JSON.parse(JSON.stringify(updated))
          this.originalUser = JSON.parse(JSON.stringify(updated))
          localStorage.setItem("loggedUser", JSON.stringify(updated))
        }
        this.profileImage = null
        this.editing = false
      })
    })
  }

  onFileSelected(event: any): void {
    const file: File = event.target.files[0]
    if (!file) return

    if (!['image/png', 'image/jpeg'].includes(file.type)) {
      this.showMessage('❌ Only PNG and JPG formats are allowed')
      this.profileImage = null
      return
    }

    const img = new Image()
    img.src = URL.createObjectURL(file)
    img.onload = () => {
      const { width, height } = img
      if (width < 100 || height < 100 || width > 300 || height > 300) {
        this.showMessage('❌ Picture must be between 100x100 and 300x300 px')
        this.profileImage = null
      } else {
        this.profileImage = file
      }
    }
  }
}
