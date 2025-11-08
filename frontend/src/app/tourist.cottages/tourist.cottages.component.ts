import { Component, inject, OnInit } from '@angular/core';
import { CottageService } from '../services/cottage.service';
import { Cottage } from '../models/cottage';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Reservation } from '../models/reservation';

@Component({
  selector: 'app-tourist.cottages',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterLink],
  templateUrl: './tourist.cottages.component.html',
  styleUrl: './tourist.cottages.component.css'
})
export class TouristCottagesComponent implements OnInit {

  private cottageService = inject(CottageService)
  allCottages: Cottage[] = []

  ngOnInit(): void {
    this.cottageService.getAll().subscribe(cottages => {
      if(cottages) this.allCottages = cottages
    })
  }

  searchName = ""
  searchLocation = ""
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

  avgRating(reservations: Reservation[]): number {
    reservations = reservations.filter(r => r.rating !== null)
    if (reservations.length == 0) return 0
    let sum = 0
    reservations.forEach(r => {
        sum += r.rating!
    })
    return sum / reservations.length
  }

  getFullStars(reservations: Reservation[]): number[] {
    const avg = this.avgRating(reservations)
    const full = Math.floor(avg)
    return Array.from({ length: full }, (_, i) => i);
  }

  getEmptyStars(reservations: Reservation[]): number[] {
    const avg = this.avgRating(reservations)
    const full = Math.floor(avg)
    const empty = 5 - full - (avg % 1 > 0 ? 1 : 0)
    return Array.from({ length: empty }, (_, i) => i);
  }

}
