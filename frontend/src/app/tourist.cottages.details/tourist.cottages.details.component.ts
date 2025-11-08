import { Component, inject, OnInit, ViewChild } from '@angular/core'
import { ActivatedRoute, RouterLink } from '@angular/router'
import { CottageService } from '../services/cottage.service'
import { Cottage } from '../models/cottage'
import { DatePipe } from '@angular/common'
import 'ol/ol.css'
import Map from 'ol/Map'
import View from 'ol/View'
import TileLayer from 'ol/layer/Tile'
import OSM from 'ol/source/OSM'
import { fromLonLat } from 'ol/proj'
import Feature from 'ol/Feature'
import Point from 'ol/geom/Point'
import VectorSource from 'ol/source/Vector'
import VectorLayer from 'ol/layer/Vector'
import Style from 'ol/style/Style'
import Icon from 'ol/style/Icon'
import { FormBuilder, FormGroup, Validators } from '@angular/forms'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatInputModule } from '@angular/material/input'
import { MatDatepickerModule } from '@angular/material/datepicker'
import { MatNativeDateModule } from '@angular/material/core'
import { MatStepper, MatStepperModule } from '@angular/material/stepper'
import { MatSnackBar } from '@angular/material/snack-bar'

@Component({
  selector: 'app-tourist-cottages-details',
  standalone: true,
  imports: [
    DatePipe,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatStepperModule,
    RouterLink
  ],
  templateUrl: './tourist.cottages.details.component.html',
  styleUrls: ['./tourist.cottages.details.component.css']
})
export class TouristCottagesDetailsComponent implements OnInit {

  @ViewChild('stepper') stepper!: MatStepper
  private route = inject(ActivatedRoute)
  private cottageService = inject(CottageService)
  firstFormGroup!: FormGroup
  secondFormGroup!: FormGroup
  totalPrice = 0
  unavailableDates: Date[] = []
  fb = inject(FormBuilder)
  loggedUser: User = new User()
  snackBar = inject(MatSnackBar)
  newReservation: Reservation = new Reservation()
  minDate = new Date()

  cottage: Cottage = new Cottage()
  map!: Map

  ngOnInit() {
    this.loggedUser = JSON.parse(localStorage.getItem("loggedUser")!)

    this.firstFormGroup = this.fb.group({
      startDate: [null, Validators.required],
      startTime: ['14:00', Validators.required],
      endDate: [null, Validators.required],
      endTime: ['10:00', Validators.required],
      adults: [1, [Validators.required, Validators.min(1)]],
      children: [0, [Validators.required, Validators.min(0)]]
    }, { validators: [dateRangeValidator(), timeRangeValidator()] })

    this.secondFormGroup = this.fb.group({
      cardNumber: [this.loggedUser.creditCard || '', [Validators.required, Validators.minLength(16), Validators.maxLength(16)]],
      requests: ['', Validators.maxLength(500)]
    })

    this.firstFormGroup.valueChanges.subscribe(() => this.updatePrice())

    this.firstFormGroup.get('startDate')?.valueChanges.subscribe(date => {
      if (date) {
        const nextDay = new Date(date);
        nextDay.setDate(nextDay.getDate() + 1);
        this.firstFormGroup.get('endDate')?.setValue(nextDay);
      }
    })

    const id = this.route.snapshot.paramMap.get('id')
    if (id) {
      this.cottageService.getAll().subscribe(cottages => {
        const c = cottages.find(c => c.id === +id)
        if (c) {
          this.cottage = c
          this.initMap()
          this.collectUnavailableDates()
        }
      })
    }
  }

  initMap() {
    if (!this.cottage.coordinates) return

    const lat = this.dmsToDecimal(this.cottage.coordinates.x)
    const lon = this.dmsToDecimal(this.cottage.coordinates.y)

    const coordinate = fromLonLat([lon, lat])

    this.map = new Map({
      target: 'map',
      layers: [
        new TileLayer({ source: new OSM() })
      ],
      view: new View({ center: coordinate, zoom: 18 })
    })

    const marker = new Feature({ geometry: new Point(coordinate) })
    marker.setStyle(new Style({
      image: new Icon({
        src: 'images/mapMarker.png',
        anchor: [0.5, 1],
        scale: 1
      })
    }))

    const vectorSource = new VectorSource({ features: [marker] })
    const markerLayer = new VectorLayer({ source: vectorSource })
    this.map.addLayer(markerLayer)
  }

  dmsToDecimal(dms: string): number {
    if (!dms) return 0

    const regex = /(\d+)°(\d+)'(\d+(?:\.\d+)?)"?([NSEW])/i
    const match = dms.match(regex)

    if (!match) {
      console.warn('Invalid DMS string:', dms)
      return 0
    }

    const deg = parseFloat(match[1])
    const min = parseFloat(match[2])
    const sec = parseFloat(match[3])
    const dir = match[4].toUpperCase()

    let decimal = deg + min / 60 + sec / 3600

    if (dir === 'S' || dir === 'W') decimal = -decimal

    return decimal

  }

  updatePrice() {

    const start: Date = this.firstFormGroup.get('startDate')?.value
    const end: Date = this.firstFormGroup.get('endDate')?.value
    if (!start || !end) {
      this.totalPrice = 0
      return
    }

    let total = 0
    const current = new Date(start)

    while (current < end) {
      const month = current.getMonth() + 1
      if (month >= 5 && month <= 8) {
        total += this.cottage.prices.summer
      }
      else {
        total += this.cottage.prices.winter
      }
      current.setDate(current.getDate() + 1) 
    }

    const adults = this.firstFormGroup.get('adults')?.value || 1
    const children = this.firstFormGroup.get('children')?.value || 0

    this.totalPrice = total * adults + total * 0.5 * children

  }


  submitBooking() {
    const startDate = this.firstFormGroup.value.startDate
    const startTime = this.firstFormGroup.value.startTime
    const endDate = this.firstFormGroup.value.endDate
    const endTime = this.firstFormGroup.value.endTime

    let startDateTime: Date = new Date(Date.now())
    let endDateTime: Date = new Date(Date.now())

    if (startDate && startTime && endDate && endTime) {
      const [startHours, startMinutes] = startTime.split(':').map(Number)
      const [endHours, endMinutes] = endTime.split(':').map(Number)

      startDateTime = new Date(startDate)
      startDateTime.setHours(startHours, startMinutes, 0, 0)

      endDateTime = new Date(endDate)
      endDateTime.setHours(endHours, endMinutes, 0, 0)
    }

    const unavailable = this.unavailableDates.some(
      d => d >= startDate && d <= endDate
    )

    if (unavailable) {
      this.snackBar.open('❌ The cottage is not available for the selected period.', 'Close', {
        duration: 4000,
        panelClass: ['snackbar-error'],
        horizontalPosition: 'center',
        verticalPosition: 'top'
      })
      return
    }

    const availableDate = new Date(this.cottage.dateAvailable)
    if (startDateTime < availableDate) {
      this.snackBar.open(`❌ The cottage is blocked until ${availableDate.toLocaleDateString()}.`, 'Close', {
        duration: 4000,
        panelClass: ['snackbar-error'],
        horizontalPosition: 'center',
        verticalPosition: 'top'
      })
      return
    }

    const creditCardRegex = /^(?:(?:4539|4556|4916|4532|4929|4485|4716)\d{12}|5[1-5]\d{14}|(?:30[0-3]\d{12}|3[68]\d{13}))$/
    const cardNumber = this.secondFormGroup.value.cardNumber?.replace(/\s+/g, '')
    const cardNumberValid = creditCardRegex.test(cardNumber)

    if (!cardNumberValid) {
      this.snackBar.open('💳 Invalid card number.', 'Close', {
        duration: 4000,
        panelClass: ['snackbar-error'],
        horizontalPosition: 'center',
        verticalPosition: 'top'
      })
      this.secondFormGroup.get('cardNumber')?.setErrors({ invalidCard: true })
      return
    }

    if (!this.firstFormGroup.valid || !this.secondFormGroup.valid) {
      this.snackBar.open('❌ Please fill in all required fields.', 'Close', {
        duration: 3000,
        panelClass: ['snackbar-warning'],
        horizontalPosition: 'center',
        verticalPosition: 'top'
      })
      return
    }

    
    this.newReservation = {
      id: this.getMaxReservationId(this.cottage) + 1,
      tourist: this.loggedUser.username,
      startDate: new Date(startDateTime.getTime() - startDateTime.getTimezoneOffset() * 60000),
      endDate: new Date(endDateTime.getTime() - endDateTime.getTimezoneOffset() * 60000),
      numAdults: this.firstFormGroup.value.adults,
      numChildren: this.firstFormGroup.value.children,
      requests: this.secondFormGroup.value.requests || '',
      status: 'waiting',
      declinedComment: '',
      rating: null,
      touristComment: ''
    }

    this.cottageService.addReservation(this.cottage.id, this.newReservation).subscribe(ok => {
        this.snackBar.open(ok, 'Close', {
          duration: 3000,
          panelClass: ['snackbar-success'],
          horizontalPosition: 'center',
          verticalPosition: 'top'
        })
        

        const id = this.route.snapshot.paramMap.get('id')
        if (id) {
          this.cottageService.getAll().subscribe(cottages => {
            const c = cottages.find(c => c.id === +id)
            if (c) {
              this.cottage = c
              this.collectUnavailableDates()
            }
          })
        }

        setTimeout(() => {

          this.firstFormGroup.patchValue({
            startTime: '14:00',
            endTime: '10:00',
            adults: 1,
            children: 0,
            startDate: null,
            endDate: null,
          })

          this.secondFormGroup.patchValue({
            cardNumber: this.loggedUser.creditCard || '',
            requests: ''
          })

        })

        this.totalPrice = 0
        this.stepper.reset()
    })

  }

  collectUnavailableDates() {
    this.unavailableDates = []
    this.cottage.reservations.forEach(r => {
      if (r.status === 'approved') {
        const start = new Date(r.startDate)
        const end = new Date(r.endDate)
        for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
          this.unavailableDates.push(new Date(d))
        }
      }
    })
  }

  getMaxReservationId(cottage: Cottage): number {
      if (cottage.reservations.length === 0) return 0

      const ids = cottage.reservations.map(r => r.id)
      return Math.max(...ids)
  } 
  
}

import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms'
import { User } from '../models/user'
import { Reservation } from '../models/reservation'

export function dateRangeValidator(): ValidatorFn {
  return (group: AbstractControl): ValidationErrors | null => {
    const start = group.get('startDate')?.value
    const end = group.get('endDate')?.value

    if (!start || !end) return null

    const startDate = new Date(start)
    const endDate = new Date(end)

    return endDate > startDate ? null : { invalidRange: true }
  }
}

export function timeRangeValidator(): ValidatorFn {
  return (group: AbstractControl): ValidationErrors | null => {
    const startTime = group.get('startTime')?.value
    const endTime = group.get('endTime')?.value

    if (!startTime || !endTime) return null

    if (startTime < '14:00' || endTime > '10:00') {
      return { invalidTime: true }
    }

    return null
  }
}
