import { Component, ViewChild } from '@angular/core';
// import { HeaderComponent } from '../@theme/components/header/header.component';
import { MENU_ITEMS } from './pages-menu';
import { MENU_ITEMS1 } from './pages-menu';

@Component({
  selector: 'ngx-pages',
  styleUrls: ['pages.component.scss'],
  template: `
    <ngx-one-column-layout>
      <nb-menu [items]="menu"></nb-menu>
      <router-outlet></router-outlet>
    </ngx-one-column-layout>
  `,
  // directives: [HeaderComponent]
})

export class PagesComponent {
  // @ViewChild(HeaderComponent) child: HeaderComponent;
  menu: any
  constructor() {
    this.checkRole()
  }

  checkRole() {
    let user_data = JSON.parse(localStorage.getItem('user_data'))
    if (user_data['role_id'] == 1) {
      this.menu = MENU_ITEMS;
    }
    if (user_data['role_id'] == 2) {
      this.menu = MENU_ITEMS1
    }
  }

  // changeOfRoutes() {
  //   console.log(this.child)
  //   if (this.child) {
  //     this.child.getNotification()
  //     console.log('*********')

  //   }
  // }

}
