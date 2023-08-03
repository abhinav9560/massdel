import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  baseUrl = environment['url']
  constructor(private http: HttpClient) { }

  get(data) {
    return this.http.post(`${this.baseUrl}category/get`, data)
  }
  inactive(data) {
    return this.http.post(`${this.baseUrl}category/inactive`, data)
  }
  active(data) {
    return this.http.post(`${this.baseUrl}category/active`, data)
  }
  delete(data) {
    return this.http.post(`${this.baseUrl}category/delete`, data)
  }
  insert(data) {
    return this.http.post(`${this.baseUrl}category/insert`, data)
  }
  update(data) {
    return this.http.post(`${this.baseUrl}category/update`, data)
  }
  getSingle(data) {
    return this.http.post(`${this.baseUrl}category/getSingle`, data)
  }
  export(data) {
    return this.http.post(`${this.baseUrl}category/category/export`,data)
  }

  multiStatusChange(data) {
    return this.http.post(`${this.baseUrl}category/category/multiStatusChange`, data)
  }

  multiDelete(data) {
    return this.http.post(`${this.baseUrl}category/category/multiDelete`, data)
  }

  // Sub category
  getAllParentCategories(data) {
    return this.http.post(`${this.baseUrl}category/getAllParentCategories`, data)
  }
  // Sub category
  getSubCategory(data) {
    return this.http.post(`${this.baseUrl}category/getSubCategory`, data)
  }
  inactiveSubCategory(data) {
    return this.http.post(`${this.baseUrl}category/deactiveSubCategory`, data)
  }
  activeSubCategory(data) {
    return this.http.post(`${this.baseUrl}category/activeSubCategory`, data)
  }
  deleteSubCategory(data) {
    return this.http.post(`${this.baseUrl}category/deleteSubCategory`, data)
  }
  insertSubCategory(data) {
    return this.http.post(`${this.baseUrl}category/addSubCategory`, data)
  }
  updateSubCategory(data) {
    return this.http.post(`${this.baseUrl}category/editSubCategory`, data)
  }
  getSingleSubCategory(data) {
    return this.http.post(`${this.baseUrl}category/getSingleSubCategory`, data)
  }

  subcategoryexport(data) {
    return this.http.post(`${this.baseUrl}category/subcategory/export`,data)
  }

  subcategorymultiStatusChange(data) {
    return this.http.post(`${this.baseUrl}category/subcategory/multiStatusChange`, data)
  }

  subcategorymultiDelete(data) {
    return this.http.post(`${this.baseUrl}category/subcategory/multiDelete`, data)
  }
}
