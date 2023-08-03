import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class WalletService {

  baseUrl = environment['url']
  constructor(private http: HttpClient) { }

  get(data) {
    return this.http.post(`${this.baseUrl}wallet/get`, data)
  }

  approved(data) {
    return this.http.post(`${this.baseUrl}wallet/approved`, data)
  }

  reject(data) {
    return this.http.post(`${this.baseUrl}wallet/reject`, data)
  }

  getUserlist(data) {
    return this.http.post(`${this.baseUrl}wallet/getuser`, data)
  }

  getCustomer(data) {
    return this.http.post(`${this.baseUrl}wallet/getCustomer`, data)
  }

  updatewallet(data) {
    return this.http.post(`${this.baseUrl}wallet/updatewallet`, data)
  }

  getTransaction(data) {
    return this.http.post(`${this.baseUrl}wallet/getTransaction`, data)
  }

  getSingleUser(data) {
    return this.http.post(`${this.baseUrl}wallet/getSingleUser`, data)
  }

}
