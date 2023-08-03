import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class BookingService {

  baseUrl = environment['url']
  constructor(private http: HttpClient) { }

  get(data) {
    return this.http.post(`${this.baseUrl}booking/get`, data)
  }

  inactive(data) {
    return this.http.post(`${this.baseUrl}booking/inactive`, data)
  }

  active(data) {
    return this.http.post(`${this.baseUrl}booking/active`, data)
  }

  delete(data) {
    return this.http.post(`${this.baseUrl}booking/delete`, data)
  }

  insert(data) {
    return this.http.post(`${this.baseUrl}booking/insert`, data)
  }

  update(data) {
    return this.http.post(`${this.baseUrl}booking/update`, data)
  }

  getSingle(data) {
    return this.http.post(`${this.baseUrl}booking/getSingle`, data)
  }

  deleteBooking(data) {
    return this.http.post(`${this.baseUrl}booking/delete`, data)
  }

  cancleBooking(data) {
    return this.http.post(`${this.baseUrl}booking/cancle`, data)
  }

  searchCustomer(data) {
    return this.http.post(`${this.baseUrl}booking/customerautocomplete`, data)
  }

  searchProvider(data) {
    return this.http.post(`${this.baseUrl}booking/providerautocomplete`, data)
  }

  getAllCat(data) {
    return this.http.post(`${this.baseUrl}booking/getAllCat`, data)
  }

  getSubCat(data) {
    return this.http.post(`${this.baseUrl}booking/getSubCat`, data)
  }

  insertBooking(data) {
    return this.http.post(`${this.baseUrl}booking/insertBooking`, data)
  }

  changeProvider(data) {
    return this.http.post(`${this.baseUrl}booking/changeProvider`, data)
  }
}
