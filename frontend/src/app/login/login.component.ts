import { Component, inject, OnInit } from '@angular/core';
import { UserService } from '../services/user.service';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { User } from '../models/user';
import { Cottage } from '../models/cottage';
import { CottageService } from '../services/cottage.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent implements OnInit {

  passwordRegex = /^(?=[A-Za-z])(?=(?:.*[a-z]){3,})(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9])[A-Za-z\d\S]{6,10}$/
  creditCardRegex = /^(?:(?:4539|4556|4916|4532|4929|4485|4716)\d{12}|5[1-5]\d{14}|(?:30[0-3]\d{12}|3[68]\d{13}))$/
  private userService = inject(UserService)
  private cottageService = inject(CottageService)
  private router = inject(Router)
  private route = inject(ActivatedRoute)
  private snackBar = inject(MatSnackBar)
  allUsers: User[] = []
  allOwners: User[] = []
  allTourists: User[] = []
  allCottages: Cottage[] = []
  newUser: User = new User()
  profileImage: File | null = null
  username = ''
  password = ''
  isAdmin = false
  reservedCottagesLast24h = 0
  reservedCottagesLast7d = 0
  reservedCottagesLast30d = 0
  cardImage = ''
  searchName = ''
  searchLocation = ''

  ngOnInit(): void {

    this.isAdmin = this.route.snapshot.routeConfig!.path!.includes('hidden')
    this.userService.getAll().subscribe(users => {
      if(users) {
        this.allUsers = users
        users.forEach(user => {
          if(user.type == "owner" && user.status == "approved") this.allOwners.push(user)
          else if(user.type == "tourist" && user.status == "approved") this.allTourists.push(user)
        })
      }
    })

    this.cottageService.getAll().subscribe(cottages => {
      if(cottages) {
        this.allCottages = cottages
        for(let c of cottages) {
            if(c.reservations.length == 0) continue
            let res = c.reservations.reverse().find(r => r.status == 'approved')
            if(!res) continue
            let now = new Date(Date.now())
            let resDate = new Date(res.startDate)
            let diff = now.getTime() - resDate.getTime()
            let diffDays = Math.ceil(diff / (1000 * 3600 * 24))
            if(diffDays <= 1) this.reservedCottagesLast24h++
            if(diffDays <= 7) this.reservedCottagesLast7d++
            if(diffDays <= 30) this.reservedCottagesLast30d++
        }
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

  login() {
    this.userService.login(this.username, this.password).subscribe({
      next: (user) => {
        localStorage.setItem('loggedUser', JSON.stringify(user))
        if(this.isAdmin) {
          if(user.type == 'admin')
            this.router.navigate(['admin'])
          else
            this.showMessage('❌ Username or password incorrect')
        }
        else {
          if(user.type == 'tourist')
            this.router.navigate(['tourist'])
          else if(user.type == 'owner')
            this.router.navigate(['owner'])
          else
            this.showMessage('❌ Username or password incorrect')
        }
      },
      error: (err) => {
        if(err.status == 400) {
          this.showMessage('❌ Username or password incorrect')
        } else if(err.status == 401) {
          this.showMessage('❌ This account hasn\'t been yet approved by the administrator')
        } else if(err.status == 403) {
          this.showMessage('❌ This account was declined by the administrator')
        }
      }

    })
  }

  register() {

    if (!this.newUser.username || !this.newUser.password ||
        !this.newUser.firstName || !this.newUser.lastName ||
        !this.newUser.gender || !this.newUser.address ||
        !this.newUser.phone || !this.newUser.email ||
        !this.newUser.creditCard || !this.newUser.type) {
      this.showMessage("❌ You must fill in all the fields")
      return
    }

    if (this.allUsers.some(user => user.username == this.newUser.username)) {
      this.showMessage("❌ Username taken")
      return
    }
    if(!this.passwordRegex.test(this.newUser.password)) { this.showMessage("❌ Password does not fulfill all requirements"); return }
    if (this.allUsers.some(user => user.email == this.newUser.email)) {
      this.showMessage("❌ An account with that email already exists")
      return
    }
    if(!this.creditCardRegex.test(this.newUser.creditCard)) { this.showMessage("❌ Incorrect credit card format"); return }

    const formData = new FormData()
    formData.append('user', JSON.stringify(this.newUser))
    if (this.profileImage) {
      formData.append('profileImage', this.profileImage)
    }

    this.userService.register(formData).subscribe(ok => {
      this.showMessage(ok)
      this.userService.getAll().subscribe(users => {
        if(users) this.allUsers = users
      })
    })

  }

  detectCardType() {

    if (/^(?:30[0-3]\d{12}|3[68]\d{13})$/.test(this.newUser.creditCard)) {
      this.cardImage = "images/cards/diners.png"
    } 
    else if (/^(51|52|53|54|55)\d{14}$/.test(this.newUser.creditCard)) {
      this.cardImage = "images/cards/masterCard.png"
    } 
    else if (/^(4539|4556|4916|4532|4929|4485|4716)\d{12}$/.test(this.newUser.creditCard)) {
      this.cardImage = "images/cards/visa.png"
    } 
    else {
      this.cardImage = ""
    }
  }

  onFileSelected(event: any) {

    const file: File = event.target.files[0]
    if (!file) return

    if (!['image/png', 'image/jpeg'].includes(file.type)) {
      this.showMessage('❌ Only PNG and JPG formats are allowed')
      this.profileImage = null
      return;
    }

    const img = new Image();
    img.src = URL.createObjectURL(file)
    img.onload = () => {
      const width = img.width
      const height = img.height

      if (width < 100 || height < 100 || width > 300 || height > 300) {
        this.showMessage('❌ Picture must be between 100x100 and 300x300 px')
        this.profileImage = null
      } else {
        this.profileImage = file
      }
    }

  }

  sortNameAsc() {
    this.allCottages.sort((a, b) => a.name < b.name ? -1 : 1)
  }

  sortNameDesc() {
    this.allCottages.sort((a, b) => a.name > b.name ? -1 : 1)
  }

  sortLocationAsc() {
    this.allCottages.sort((a, b) => a.location < b.location ? -1 : 1)
  }

  sortLocationDesc() {
    this.allCottages.sort((a, b) => a.location > b.location ? -1 : 1)
  }

  search() {

    this.cottageService.getAll().subscribe(cottages => {
      if (!cottages) return
      
      this.allCottages = cottages.filter(c => {
        const matchesName = this.searchName 
          ? c.name.toLowerCase().includes(this.searchName.toLowerCase())
          : true
        const matchesLocation = this.searchLocation
          ? c.location.toLowerCase().includes(this.searchLocation.toLowerCase())
          : true
        return matchesName && matchesLocation;
      })
    })

  }

}
