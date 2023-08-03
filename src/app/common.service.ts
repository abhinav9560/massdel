import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})

export class CommonService {
  baseUrl = environment['url']
  constructor(private http: HttpClient) { }

  showLoader() {
    document.getElementById("nb-global-spinner").style.display = "block";
  }
  hideLoader() {
    document.getElementById("nb-global-spinner").style.display = "none";
  }

  getNotification(data) {
    return this.http.post(`${this.baseUrl}booking/getNotification`, data)
  }

  readNotification(data) {
    return this.http.post(`${this.baseUrl}booking/readNotification`, data)
  }

}
