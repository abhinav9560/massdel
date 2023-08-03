import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
@Injectable({
  providedIn: 'root'
})
export class CustomerService {
  baseUrl = environment['url']
  constructor(private http: HttpClient) { }

  getCity() {
    return this.http.get(`${this.baseUrl}customer/getCity`)
  }

  get(data) {
    return this.http.post(`${this.baseUrl}customer/get`, data)
  }

  inactive(data) {
    return this.http.post(`${this.baseUrl}customer/inactive`, data)
  }

  active(data) {
    return this.http.post(`${this.baseUrl}customer/active`, data)
  }

  delete(data) {
    return this.http.post(`${this.baseUrl}customer/delete`, data)
  }

  insert(data) {
    return this.http.post(`${this.baseUrl}customer/insert`, data)
  }

  update(data) {
    return this.http.post(`${this.baseUrl}customer/update`, data)
  }

  getSingle(data) {
    return this.http.post(`${this.baseUrl}customer/getSingle`, data)
  }

  export(data) {
    return this.http.post(`${this.baseUrl}customer/export`, data)
  }

  multiStatusChange(data) {
    return this.http.post(`${this.baseUrl}customer/multiStatusChange`, data)
  }

  multiDelete(data) {
    return this.http.post(`${this.baseUrl}customer/multiDelete`, data)
  }

  changePassword(data) {
    return this.http.post(`${this.baseUrl}customer/changePassword`, data)
  }
}
