import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {

  baseUrl = environment['url']
  constructor(private http: HttpClient) { }

  get() {
    return this.http.get(`${this.baseUrl}dashboard/get`)
  }

  getChartData(data) {
    return this.http.post(`${this.baseUrl}dashboard/getChartData`, data)
  }
}
