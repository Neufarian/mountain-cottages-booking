import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Cottage } from '../models/cottage';
import { Reservation } from '../models/reservation';

@Injectable({
  providedIn: 'root'
})
export class CottageService {

  constructor() { }

  private http = inject(HttpClient)
  private url = "http://localhost:4000/cottages"

  getAll() {
    return this.http.get<Cottage[]>(`${this.url}/getAll`)
  }

  blockTemp(cId: number, d: Date) {
    return this.http.post<string>(`${this.url}/blockTemp`, {id: cId, dateAvailable: d})
  }

  rateCottage(cId: number, rId: number, r: number, c: string) {
    const data = {
      cottageId: cId,
      reservationId: rId,
      rating: r,
      touristComment: c
    }
    return this.http.post<string>(`${this.url}/rateCottage`, data)
  }

  cancelReservation(cId: number, rId: number) {
    return this.http.post<string>(`${this.url}/cancelReservation`, {cottageId: cId, reservationId: rId})
  }

  processReservation(cId: number, rId: number, s: string, c: string) {
    const data = {
      cottageId: cId,
      reservationId: rId,
      status: s,
      declinedComment: c
    }
    return this.http.post<string>(`${this.url}/processReservation`, data)
  }

  editCottage(fd: FormData) {
    return this.http.post<string>(`${this.url}/editCottage`, fd)
  }

  deleteCottage(cId: number) {
    return this.http.post<string>(`${this.url}/deleteCottage`, {cottageId: cId})
  }
  
  registerCottage(fd: FormData) {
    return this.http.post<string>(`${this.url}/registerCottage`, fd)
  } 

  addReservation(cId: number, r: Reservation) {
    return this.http.post<string>(`${this.url}/addReservation`, {cottageId: cId, reservation: r})
  }

}
