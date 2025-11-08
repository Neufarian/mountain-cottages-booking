import { Component, inject, OnInit } from '@angular/core'
import { CottageService } from '../services/cottage.service'
import { Cottage } from '../models/cottage'
import { User } from '../models/user'
import { Reservation } from '../models/reservation'
import { DatePipe } from '@angular/common'
import { FormsModule } from '@angular/forms'
import { MatSnackBar } from '@angular/material/snack-bar'

@Component({
  selector: 'app-owner.cottages',
  standalone: true,
  imports: [DatePipe, FormsModule],
  templateUrl: './owner.cottages.component.html',
  styleUrl: './owner.cottages.component.css'
})
export class OwnerCottagesComponent implements OnInit {

  coordinatesRegex = /^(\d{1,3})°(\d{1,2})'([\d.]+)"([NSEW])$/
  private cottageService = inject(CottageService)
  private snackBar = inject(MatSnackBar)
  loggedUser: User = new User()
  myCottages: Cottage[] = []
  showEdit = false
  allCottages: Cottage[] = []
  edtCottage: Cottage = new Cottage()
  oldCottage: Cottage = new Cottage()
  newCottage: Cottage = new Cottage()
  selectedFiles: File[] = []

  ngOnInit(): void {
    
    this.loggedUser = JSON.parse(localStorage.getItem("loggedUser")!)
    this.cottageService.getAll().subscribe(cottages => {
      if(cottages) {
        this.allCottages = cottages
        this.myCottages = cottages.filter(c => c.owner == this.loggedUser.username)
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
  
  avgRating(reservations: Reservation[]): number {

    reservations = reservations.filter(r => r.rating !== null)
    if (reservations.length == 0) return 0
    let sum = 0
    reservations.forEach(r => {
        sum += r.rating!
    })
    return sum / reservations.length

  }

  startEdit(cottage: Cottage) {

    this.oldCottage = JSON.parse(JSON.stringify(cottage))
    this.edtCottage = JSON.parse(JSON.stringify(cottage))
    this.showEdit = true

  }

  editCottage() {

    if (!this.edtCottage.name || !this.edtCottage.location ||
        !this.edtCottage.services || !this.edtCottage.phone) {
      this.showMessage("❌ You must fill in all the fields")
      return
    }

    if (JSON.stringify(this.edtCottage) === JSON.stringify(this.oldCottage)) {
      this.showEdit = false 
      return 
    }

    if (!this.coordinatesRegex.test(this.edtCottage.coordinates.x) || 
    !this.coordinatesRegex.test(this.edtCottage.coordinates.y)) {
      this.showMessage("❌ Please enter the coordinates in the correct format")
      return
    }

    const formData = new FormData()
    formData.append('oldCottage', JSON.stringify(this.oldCottage)) 
    formData.append('edtCottage', JSON.stringify(this.edtCottage))

    this.cottageService.editCottage(formData).subscribe(ok => {
      this.showMessage(ok)
      this.cottageService.getAll().subscribe(cottages => {
        if(cottages) this.myCottages = cottages.filter(c => c.owner == this.loggedUser.username)
      })
      this.showEdit = false
    })

  }

  deleteCottage(cId: number) {

    this.cottageService.deleteCottage(cId).subscribe(ok => {
      this.showMessage(ok)
      this.cottageService.getAll().subscribe(cottages => {
        if(cottages) this.myCottages = cottages.filter(c => c.owner == this.loggedUser.username)
      })
    })

  }

  onFilesSelected(event: Event) {

    const input = event.target as HTMLInputElement
    if (input.files) {
      this.selectedFiles = Array.from(input.files)
    }

  }

  onJsonSelected(event: Event) {

    const input = event.target as HTMLInputElement
    if (input.files && input.files.length > 0) {
      const file = input.files[0]
      const reader = new FileReader()

      reader.onload = (e: ProgressEvent<FileReader>) => {
          const json = JSON.parse(e.target?.result as string)
          this.newCottage = {
            ...this.newCottage,
            ...json
          }
      }

      reader.readAsText(file)
    }

  }

  getMaxCottageId(allCottages: Cottage[]): number {
      if (allCottages.length === 0) return 0

      const ids = allCottages.map(c => c.id)
      return Math.max(...ids)
  } 

  registerCottage() {

    if (!this.newCottage.name || !this.newCottage.location ||
        !this.newCottage.services || !this.newCottage.phone) {
      this.showMessage("❌ You must fill in all the fields")
      return
    }

    if (!this.coordinatesRegex.test(this.newCottage.coordinates.x) ||
    !this.coordinatesRegex.test(this.newCottage.coordinates.y)) {
      this.showMessage("❌ Please enter the coordinates in the correct format")
      return
    }

    this.newCottage.id = this.getMaxCottageId(this.allCottages) + 1
    this.newCottage.owner = this.loggedUser.username
    this.newCottage.dateAvailable = new Date(Date.now())

    const formData = new FormData()
    formData.append('newCottage', JSON.stringify(this.newCottage))

    for (const file of this.selectedFiles) {
      formData.append('pictures', file)
    }

    this.cottageService.registerCottage(formData).subscribe(ok => {
      this.showMessage(ok)
      this.ngOnInit()
    })
  
  }

}
