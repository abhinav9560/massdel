import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';


@Injectable({
  providedIn: 'root'
})
export class ServiceproviderService {
  baseUrl = environment['url']
  constructor(private http: HttpClient) { }

  getCity() {
    return this.http.get(`${this.baseUrl}serviceprovider/getCity`)
  }

  getLanguage() {
    return this.http.get(`${this.baseUrl}serviceprovider/getLanguage`)
  }

  getQualification() {
    return this.http.get(`${this.baseUrl}serviceprovider/getQualification`)
  }

  getTraining() {
    return this.http.get(`${this.baseUrl}serviceprovider/getTraining`)
  }

  getserviceproviderList(data) {
    return this.http.post(`${this.baseUrl}serviceprovider/getServiceprovider`, data)
  }

  inactiveServiceprovider(data) {
    return this.http.post(`${this.baseUrl}serviceprovider/inactiveServiceprovider`, data)
  }

  activeServiceprovider(data) {
    return this.http.post(`${this.baseUrl}serviceprovider/activeServiceprovider`, data)
  }

  deleteServiceprovider(data) {
    return this.http.post(`${this.baseUrl}serviceprovider/deleteServiceprovider`, data)
  }
  insertServiceprovider(data) {
    return this.http.post(`${this.baseUrl}serviceprovider/insertServiceprovider`, data)
  }
  updateServiceprovider(data) {
    return this.http.post(`${this.baseUrl}serviceprovider/updateServiceprovider`, data)
  }
  getSingleServiceprovider(data) {
    return this.http.post(`${this.baseUrl}serviceprovider/getSingleServiceprovider`, data)
  }

  getAllCategory(data) {
    return this.http.post(`${this.baseUrl}category/getAllParentCategories`, data)
  }
  getSubcategory(data) {
    return this.http.post(`${this.baseUrl}category/getSubCatById`, data)
  }


  export(data) {
    return this.http.post(`${this.baseUrl}serviceprovider/export`, data)
  }


  multiStatusChange(data) {
    return this.http.post(`${this.baseUrl}serviceprovider/multiStatusChange`, data)
  }

  multiDelete(data) {
    return this.http.post(`${this.baseUrl}serviceprovider/multiDelete`, data)
  }

  canTakeBooking(data) {
    return this.http.get(`${this.baseUrl}serviceprovider/canTakeBooking/${data}`)
  }

  getBankAccounts(data) {
    return this.http.get(`${this.baseUrl}serviceprovider/getBankAccounts/${data}`)
  }

  changePassword(data) {
    return this.http.post(`${this.baseUrl}serviceprovider/changePassword`, data)
  }

}
