import { Component, OnInit } from '@angular/core';
import { CommonService } from 'app/common.service';
import { AdminService } from '../admin.service';
import { Router, ActivatedRoute } from '@angular/router';
import { NbToastrService } from '@nebular/theme';

@Component({
  selector: 'ngx-admin-add',
  templateUrl: './admin-add.component.html',
  styleUrls: ['./admin-add.component.scss']
})
export class AdminAddComponent implements OnInit {
  userData: any = {
    access: []
  }
  id
  showPassword = false
  access: any = []
  subCategory: any = []
  accessArray = [
    { value: 1, name: 'User Management' },
    { value: 2, name: 'Category Management' },
    { value: 3, name: 'Booking Management' },
    { value: 4, name: 'Chat Support Management' },
    // { value: 5, name: 'Commision Management' },
    { value: 6, name: 'Wallet Management' },
    { value: 7, name: 'Content Management' },
    { value: 8, name: 'Promo Code Management' },
  ]

  allowed = {
    uppers: "QWERTYUIOPASDFGHJKLZXCVBNM",
    lowers: "qwertyuiopasdfghjklzxcvbnm",
    numbers: "1234567890",
    symbols: "!@#$%^&*"
  }

  constructor(private common: CommonService, private adminservice: AdminService, private router: Router, private routes: ActivatedRoute, private toastrService: NbToastrService) { }

  ngOnInit(): void {
    this.userData.access = []
    this.access = []
    this.common.showLoader()
    this.id = this.routes.snapshot.params.id;
    if (this.id) {
      const newformData = new FormData();
      newformData.append('user_id', this.id);
      this.adminservice.getSingleSubAdmin(newformData).subscribe(res => {
        this.userData = res['response']
        this.access = res['response']['access'].map(Number);
        // this.accessArray.forEach(element => {
        //   res['response'].access.forEach(ele => {
        //       if(element['value'] == ele){
        //         this.access.push(element)
        //       }
        //   });
        // });

        this.common.hideLoader()
      })
      this.showPassword = false
    } else {
      this.common.hideLoader()
      this.showPassword = false
    }
  }

  userSubmit = async (formData) => {

    if (formData.name.trim().length < 3) {
      this.toastrService.show('error', 'Invalid Name', { status: 'danger' });
      this.common.hideLoader()
      return
    }
    if (formData.email.trim().length < 3) {
      this.toastrService.show('error', 'Invalid email', { status: 'danger' });
      this.common.hideLoader()
      return
    }
    if (formData.password) {
      if (formData.password.trim().length < 3) {
        this.toastrService.show('error', 'Invalid password', { status: 'danger' });
        this.common.hideLoader()
        return
      }
    }


    this.common.showLoader()
    if (!this.id) {
   
        const newformData = new FormData();
        newformData.append('name', formData.name.trim());
        newformData.append('email', formData.email.trim().toLowerCase());
        newformData.append('password', formData.password.trim());
        let temp = this.access.join(",");
        newformData.append('access', temp);
        // newformData.append('mobile', formData.mobile);
        this.adminservice.insertSubAdmin(newformData).subscribe((response) => {
          this.common.hideLoader()
          if (response['status'] == 1) {
            this.router.navigate(['admin']);
            this.toastrService.show('success', response['message'], { status: 'success' });
          } else {
            this.toastrService.show('error', response['message'], { status: 'danger' });
          }
        });
    }
    else {
        const newformData = new FormData();
        newformData.append('user_id', this.id);
        newformData.append('name', formData.name.trim());
        newformData.append('email', formData.email.trim().toLowerCase());
        newformData.append('password', formData.password);
        let temp = this.access.join(",");
        newformData.append('access', temp);
        console.log(temp)
        this.adminservice.updateSubAdmin(newformData).subscribe((response) => {
          this.common.hideLoader()
          if (response['status'] == 1) {
            this.router.navigate(['admin/view', this.id]);
            this.toastrService.show('success', response['message'], { status: 'success' });
          } else {
            this.toastrService.show('success', response['message'], { status: 'danger' });
          }
        });
    }
  };

  getRandomCharFromString = (str) => str.charAt(Math.floor(Math.random() * str.length))
  generatePassword = (length) => { // password will be @Param-length, default to 8, and have at least one upper, one lower, one number and one symbol
    let pwd = "";
    pwd += this.getRandomCharFromString(this.allowed.uppers); //pwd will have at least one upper
    pwd += this.getRandomCharFromString(this.allowed.lowers); //pwd will have at least one lower
    pwd += this.getRandomCharFromString(this.allowed.numbers); //pwd will have at least one number
    pwd += this.getRandomCharFromString(this.allowed.symbols);//pwd will have at least one symbolo
    for (let i = pwd.length; i < length; i++)
      pwd += this.getRandomCharFromString(Object.values(this.allowed).join('')); //fill the rest of the pwd with random characters
    return pwd
  }

  passwordGenerate() {
    let pass = this.generatePassword(6)
    this.userData['password'] = pass
  }
  toggleShowPassword() {
    this.showPassword = !this.showPassword
  }

  compareWithFn(item1, item2) {
    console.log(item1)
    console.log(item2)
    return item1 && item2 ? item1.value === item2.value : item1 === item2;
  }

  accessChange(e) {
    console.log(e)
    this.userData.access = e
    this.access = e
  }

  goBack() {
    window.history.back()
  }
}
