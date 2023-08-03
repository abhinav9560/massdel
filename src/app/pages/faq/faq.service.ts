import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class FaqService {

  baseUrl = environment['url']
  constructor(private http: HttpClient) { }

  get(data) {
    return this.http.post(`${this.baseUrl}faq/get`, data)
  }
  inactive(data) {
    return this.http.post(`${this.baseUrl}faq/inactive`, data)
  }
  active(data) {
    return this.http.post(`${this.baseUrl}faq/active`, data)
  }
  delete(data) {
    return this.http.post(`${this.baseUrl}faq/delete`, data)
  }
  insert(data) {
    return this.http.post(`${this.baseUrl}faq/insert`, data)
  }
  update(data) {
    return this.http.post(`${this.baseUrl}faq/update`, data)
  }
  getSingle(data) {
    return this.http.post(`${this.baseUrl}faq/getSingle`, data)
  }

}
