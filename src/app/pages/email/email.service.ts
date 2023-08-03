import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class EmailService {

  baseUrl = environment['url']
  constructor(private http: HttpClient) { }

  get(data) {
    return this.http.post(`${this.baseUrl}email/get`, data)
  }
  inactive(data) {
    return this.http.post(`${this.baseUrl}email/inactive`, data)
  }
  active(data) {
    return this.http.post(`${this.baseUrl}email/active`, data)
  }
  delete(data) {
    return this.http.post(`${this.baseUrl}email/delete`, data)
  }
  insert(data) {
    return this.http.post(`${this.baseUrl}email/insert`, data)
  }
  update(data) {
    return this.http.post(`${this.baseUrl}email/update`, data)
  }
  getSingle(data) {
    return this.http.post(`${this.baseUrl}email/getSingle`, data)
  }

}
