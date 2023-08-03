import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ChatService {

  baseUrl = environment['url']
  constructor(private http: HttpClient) { }

  getMessage() {
    return this.http.get(`${this.baseUrl}chat/getConversation`)
  }

  getMessageofuser(id) {
    return this.http.get(`${this.baseUrl}chat/getMessage/${id}`)
  }

  sendMessate(data) {
    return this.http.post(`${this.baseUrl}chat/sendMessage`, data)
  }
}
