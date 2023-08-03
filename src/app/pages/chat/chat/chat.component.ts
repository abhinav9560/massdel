import { Component, OnDestroy, OnInit } from '@angular/core';
import { NbToastrService } from '@nebular/theme';
import { CommonService } from 'app/common.service';
import { ChatService } from '../chat.service';
import { io } from "socket.io-client";


@Component({
  selector: 'ngx-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss']
})

export class ChatComponent implements OnInit, OnDestroy {
  items
  data: any = {}
  adminId
  message = []
  showChatBlock: Boolean = false
  userDetail = {}
  groupId
  user
  chatUrl = ''
  intervel
  constructor(private chatservice: ChatService, private toastrService: NbToastrService, private common: CommonService) {
    // this.adminId
    let userId = localStorage.getItem('user_id')
    const socket = io("https://massdl.devtechnosys.tech:17344", { query: { auth: userId,test:'test' } });

    console.log(socket)
    socket.on('connect', () => {
      socket.on('chatReload', data => {
        console.log('chatReload socket', data)
        this.getMessages();
        this.showChat(this.groupId, this.user)
      })
    })

  }

  ngOnInit() {
    // this.common.showLoader()


    this.getMessages();
  }

  ngOnDestroy() {
    // if (this.intervel) {
    //   clearInterval(this.intervel);
    // }
  }

  getMessages = async () => {
    this.chatservice.getMessage().subscribe((res) => {
      this.data = res;
      // this.common.hideLoader()
    })
  }

  // startIntervel() {
  //   if (this.intervel) {
  //     clearInterval(this.intervel);
  //   }
  //   if (this.groupId && this.user) {
  //     this.intervel = setInterval(() => {
  //       this.showChat(this.groupId, this.user)
  //     }, 7000)
  //   }
  //   else {
  //   }
  // }

  showChat(groupId, user) {
    // this.common.showLoader()
    this.groupId = groupId
    this.user = user
    this.chatservice.getMessageofuser(groupId).subscribe((res) => {
      this.userDetail = user
      this.message = res['data']
      this.adminId = res['adminId']
      this.chatUrl = res['chatUrl']
      this.showChatBlock = true

      this.message.forEach(element => {
        element.temp = element.type ? 'file' : 'text'
      });

      // this.startIntervel()
      // this.common.hideLoader()
    })
  }

  sendMessage(messages) {
    const files = !messages.files ? null : messages.files[0]
    const newformData = new FormData();
    if (files) {
      newformData.append('type', '1')
      newformData.append('message', files)
    } else {
      newformData.append('message', messages.message)
      newformData.append('type', '0')
    }
    newformData.append('recieverId', this.userDetail['_id'])

    this.chatservice.sendMessate(newformData).subscribe((res) => {
      this.showChat(this.groupId, this.user)
    })
  }

  refresh() {
    this.ngOnInit()
  }

}

