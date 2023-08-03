import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  baseUrl = environment['url']
  constructor(private http: HttpClient) { }

  getAdminList(data) {
    return this.http.post(`${this.baseUrl}admin/getSubAdmin`, data)
  }

  inactiveSubadmin(data) {
    return this.http.post(`${this.baseUrl}admin/inactiveSubadmin`, data)
  }

  activeSubadmin(data) {
    return this.http.post(`${this.baseUrl}admin/activeSubadmin`, data)
  }

  deleteSubAdmin(data) {
    return this.http.post(`${this.baseUrl}admin/deleteSubAdmin`, data)
  }
  insertSubAdmin(data) {
    return this.http.post(`${this.baseUrl}admin/insertSubAdmin`, data)
  }
  updateSubAdmin(data) {
    return this.http.post(`${this.baseUrl}admin/updateSubAdmin`, data)
  }
  getSingleSubAdmin(data) {
    return this.http.post(`${this.baseUrl}admin/getSingleSubAdmin`, data)
  }

  export(data) {
    return this.http.post(`${this.baseUrl}admin/export`,data)
  }

  multiStatusChange(data) {
    return this.http.post(`${this.baseUrl}admin/multiStatusChange`, data)
  }

  multiDelete(data) {
    return this.http.post(`${this.baseUrl}admin/multiDelete`, data)
  }
}
