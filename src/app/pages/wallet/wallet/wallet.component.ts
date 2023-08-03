import { Component, OnInit } from '@angular/core';
import { NbComponentStatus, NbToastrService } from '@nebular/theme';
import { CommonService } from 'app/common.service';
import { WalletService } from '../wallet.service';

@Component({
  selector: 'ngx-wallet',
  templateUrl: './wallet.component.html',
  styleUrls: ['./wallet.component.scss']
})
export class WalletComponent implements OnInit {

  statuses: NbComponentStatus[] = ['info'];
  items
  data: any = {
  }
  searchItem = {
    item: '',
  };
  dateRange
  constructor(private walletservice: WalletService, private toastrService: NbToastrService, private common: CommonService ) {

  }
  ngOnInit() {
    this.common.showLoader()
    this.getUsers('1', '');
  }

  getUsers = async (pageNo, searchItem, dateRange?) => {
    const UsersList = new FormData();
    UsersList.append('pageNo', pageNo);
    UsersList.append('size', '8');
    UsersList.append('searchItem', searchItem);
    if (dateRange) {
      UsersList.append('dateRange', JSON.stringify(dateRange));
    }
    this.walletservice.get(UsersList).subscribe((res) => {
      this.data = res;
      this.items = Array.from({ length: res['pages'] }, (v, k) => k + 1);
      this.common.hideLoader()
    })
  }

  onDeleteConfirm(event): void {
    if (window.confirm('Are you sure you want to delete?')) {
      event.confirm.resolve();
    } else {
      event.confirm.reject();
    }
  }

  reject = async (Id, indexIs) => {

    if (confirm('Are you sure?')) {
      const newformData = new FormData();
      newformData.append('id', Id);
      await this.walletservice.reject(newformData).subscribe((response) => {
        if (response['status'] == 1) {
          this.toastrService.show('success', response['message'], { status: 'success' });
          this.ngOnInit()
        } else {
          this.toastrService.show('danger', 'There was an error please try after some time!!', { status: 'danger' });
        }
      });
    } else {
      return false;
    }
  }

  approved = async (Id, indexIs) => {
    if (confirm('Are you sure?')) {

      const newformData = new FormData();
      newformData.append('id', Id);
      await this.walletservice.approved(newformData).subscribe((response) => {
        if (response['status'] == 1) {
          this.toastrService.show('success', response['message'], { status: 'success' });
          this.ngOnInit()
        } else {
          this.toastrService.show('danger', 'There was an error please try after some time!!', { status: 'danger' });
        }
      });
    } else {
      return false;
    }
  }



  pageChanged(event) {
    this.getUsers(event, '')
  }
  searchEvent(searchItem) {
    this.getUsers('1', searchItem);
  };

  dateRangeChange() {
    console.log(this.dateRange)
    this.getUsers('1', '', this.dateRange);
  }
  reset() {
    this.dateRange = ''
    this.searchItem = { item: '' }
    this.ngOnInit()
  }
}
