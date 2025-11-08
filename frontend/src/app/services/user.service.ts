import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { User } from '../models/user';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor() { }

  private http = inject(HttpClient)
  private url = "http://localhost:4000/users"

  getAll() {
    return this.http.get<User[]>(`${this.url}/getAll`)
  }

  login(u: string, p: string) {
    return this.http.post<User>(`${this.url}/login`, {username: u, password: p})
  }

  register(fd: FormData) {
    return this.http.post<string>(`${this.url}/register`, fd)
  }

  changePassword(u: User, oldPass: string, newPass: string) {
    return this.http.post<string>(`${this.url}/changePassword`, {user: u, oldPassword: oldPass, newPassword: newPass})
  }

  changeStatus(u: string, s: string) {
    return this.http.post<string>(`${this.url}/changeStatus`, {username: u, status: s})
  }

  editUser(fd: FormData) {
    return this.http.post<string>(`${this.url}/editUser`, fd)
  }

  deleteUser(u: string) {
    return this.http.post<string>(`${this.url}/deleteUser`, {username: u})
  }

}
