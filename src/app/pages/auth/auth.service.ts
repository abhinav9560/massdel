import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  baseUrl = environment['url']
  constructor(private http: HttpClient) { }

  login(data) {
    return this.http.post(`${this.baseUrl}admin/login`, data)
  }

  forgetPass(data) {
    return this.http.post(`${this.baseUrl}admin/forgot_password`, data)
  }
  verifyOTP(data) {
    return this.http.post(`${this.baseUrl}admin/verifyOTP`, data)
  }
  reset_password(data) {
    return this.http.post(`${this.baseUrl}admin/reset_password`, data)
  }

  profile({ }) {
    return this.http.post(`${this.baseUrl}admin/profile`, {})
  }

  changePassowrd(data) {
    return this.http.post(`${this.baseUrl}admin/changepassword`, data)
  }


}
