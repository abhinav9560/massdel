import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CmsService {

  baseUrl = environment['url']
  constructor(private http: HttpClient) { }

  get(data) {
    return this.http.post(`${this.baseUrl}cms/get`, data)
  }
  inactive(data) {
    return this.http.post(`${this.baseUrl}cms/inactive`, data)
  }
  active(data) {
    return this.http.post(`${this.baseUrl}cms/active`, data)
  }
  delete(data) {
    return this.http.post(`${this.baseUrl}cms/delete`, data)
  }
  insert(data) {
    return this.http.post(`${this.baseUrl}cms/insert`, data)
  }
  update(data) {
    return this.http.post(`${this.baseUrl}cms/update`, data)
  }
  getSingle(data) {
    return this.http.post(`${this.baseUrl}cms/getSingle`, data)
  }

  // /T&C

  gettandc(data) {
    return this.http.post(`${this.baseUrl}cms/tandc/get`, data)
  }
  inactivetandc(data) {
    return this.http.post(`${this.baseUrl}cms/tandc/inactive`, data)
  }
  activetandc(data) {
    return this.http.post(`${this.baseUrl}cms/tandc/active`, data)
  }
  deletetandc(data) {
    return this.http.post(`${this.baseUrl}cms/tandc/delete`, data)
  }
  inserttandc(data) {
    return this.http.post(`${this.baseUrl}cms/tandc/insert`, data)
  }
  updatetandc(data) {
    return this.http.post(`${this.baseUrl}cms/tandc/update`, data)
  }
  getSingletandc(data) {
    return this.http.post(`${this.baseUrl}cms/tandc/getSingle`, data)
  }

  globalsetting(data) {
    return this.http.post(`${this.baseUrl}cms/globalsetting`, data)
  }
  getGlobalsetting() {
    return this.http.get(`${this.baseUrl}cms/globalsetting`)
  }



  // City

  getcity(data) {
    return this.http.post(`${this.baseUrl}city/get`, data)
  }
  inactivecity(data) {
    return this.http.post(`${this.baseUrl}city/inactive`, data)
  }
  activecity(data) {
    return this.http.post(`${this.baseUrl}city/active`, data)
  }
  deletecity(data) {
    return this.http.post(`${this.baseUrl}city/delete`, data)
  }
  insertcity(data) {
    return this.http.post(`${this.baseUrl}city/insert`, data)
  }
  updatecity(data) {
    return this.http.post(`${this.baseUrl}city/update`, data)
  }
  getSinglecity(data) {
    return this.http.post(`${this.baseUrl}city/getSingle`, data)
  }

  // Qualification
  getqualification(data) {
    return this.http.post(`${this.baseUrl}qualification/get`, data)
  }
  inactivequalification(data) {
    return this.http.post(`${this.baseUrl}qualification/inactive`, data)
  }
  activequalification(data) {
    return this.http.post(`${this.baseUrl}qualification/active`, data)
  }
  deletequalification(data) {
    return this.http.post(`${this.baseUrl}qualification/delete`, data)
  }
  insertqualification(data) {
    return this.http.post(`${this.baseUrl}qualification/insert`, data)
  }
  updatequalification(data) {
    return this.http.post(`${this.baseUrl}qualification/update`, data)
  }
  getSinglequalification(data) {
    return this.http.post(`${this.baseUrl}qualification/getSingle`, data)
  }

  // Language
  getlanguage(data) {
    return this.http.post(`${this.baseUrl}language/get`, data)
  }
  inactivelanguage(data) {
    return this.http.post(`${this.baseUrl}language/inactive`, data)
  }
  activelanguage(data) {
    return this.http.post(`${this.baseUrl}language/active`, data)
  }
  deletelanguage(data) {
    return this.http.post(`${this.baseUrl}language/delete`, data)
  }
  insertlanguage(data) {
    return this.http.post(`${this.baseUrl}language/insert`, data)
  }
  updatelanguage(data) {
    return this.http.post(`${this.baseUrl}language/update`, data)
  }
  getSinglelanguage(data) {
    return this.http.post(`${this.baseUrl}language/getSingle`, data)
  }

  // Training
  gettraining(data) {
    return this.http.post(`${this.baseUrl}training/get`, data)
  }
  inactivetraining(data) {
    return this.http.post(`${this.baseUrl}training/inactive`, data)
  }
  activetraining(data) {
    return this.http.post(`${this.baseUrl}training/active`, data)
  }
  deletetraining(data) {
    return this.http.post(`${this.baseUrl}training/delete`, data)
  }
  inserttraining(data) {
    return this.http.post(`${this.baseUrl}training/insert`, data)
  }
  updatetraining(data) {
    return this.http.post(`${this.baseUrl}training/update`, data)
  }
  getSingletraining(data) {
    return this.http.post(`${this.baseUrl}training/getSingle`, data)
  }

  // Slider
  getslider(data) {
    return this.http.post(`${this.baseUrl}cms/slider/get`, data)
  }
  inactiveslider(data) {
    return this.http.post(`${this.baseUrl}cms/slider/inactive`, data)
  }
  activeslider(data) {
    return this.http.post(`${this.baseUrl}cms/slider/active`, data)
  }
  deleteslider(data) {
    return this.http.post(`${this.baseUrl}cms/slider/delete`, data)
  }
  insertslider(data) {
    return this.http.post(`${this.baseUrl}cms/slider/insert`, data)
  }
  updateslider(data) {
    return this.http.post(`${this.baseUrl}cms/slider/update`, data)
  }
  getSingleslider(data) {
    return this.http.post(`${this.baseUrl}cms/slider/getSingle`, data)
  }
}
