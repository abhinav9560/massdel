import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PromoCodeService {

  baseUrl = environment['url']
  constructor(private http: HttpClient) { }

  get(data) {
    return this.http.post(`${this.baseUrl}promocode/get`, data)
  }
  inactive(data) {
    return this.http.post(`${this.baseUrl}promocode/inactive`, data)
  }
  active(data) {
    return this.http.post(`${this.baseUrl}promocode/active`, data)
  }
  delete(data) {
    return this.http.post(`${this.baseUrl}promocode/delete`, data)
  }
  insert(data) {
    return this.http.post(`${this.baseUrl}promocode/insert`, data)
  }
  update(data) {
    return this.http.post(`${this.baseUrl}promocode/update`, data)
  }
  getSingle(data) {
    return this.http.post(`${this.baseUrl}promocode/getSingle`, data)
  }

}
