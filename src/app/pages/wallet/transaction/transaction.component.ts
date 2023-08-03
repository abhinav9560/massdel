import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NbComponentStatus, NbToastrService } from '@nebular/theme';
import { CommonService } from 'app/common.service';
import { WalletService } from '../wallet.service';

@Component({
  selector: 'ngx-transaction',
  templateUrl: './transaction.component.html',
  styleUrls: ['./transaction.component.scss']
})
export class TransactionComponent implements OnInit {
  statuses: NbComponentStatus[] = ['info'];
  items
  data: any = {
  }
  searchItem = {
    item: '',
  };
  dateRange
  id
  userData: any = {}
  constructor(private common: CommonService, private walletservice: WalletService, private toastrService: NbToastrService, private routes: ActivatedRoute) {

  }
  ngOnInit() {
    this.common.showLoader()
    this.id = this.routes.snapshot.params.id;
    if (this.id) {
      const formdata = new FormData();
      formdata.append('userId', this.id);
      this.walletservice.getSingleUser(formdata).subscribe((res) => {
        this.userData = res['data']
      })
      this.getUsers('1', '');
    }
  }

  getUsers = async (pageNo, searchItem, dateRange?) => {
    const UsersList = new FormData();
    UsersList.append('pageNo', pageNo);
    UsersList.append('size', '8');
    UsersList.append('searchItem', searchItem);
    UsersList.append('userId', this.id);
    if (dateRange) {
      UsersList.append('dateRange', JSON.stringify(dateRange));
    }
    this.walletservice.getTransaction(UsersList).subscribe((res) => {
      this.data = res;
      this.items = Array.from({ length: res['pages'] }, (v, k) => k + 1);
      this.common.hideLoader()
    })
  }

  pageChanged(event) {
    this.getUsers(event, '')
  }
  searchEvent(searchItem) {
    this.getUsers('1', searchItem);
  };

  dateRangeChange() {

    this.getUsers('1', '', this.dateRange);
  }
  reset() {
    this.dateRange = ''
    this.searchItem = { item: '' }
    this.ngOnInit()
  }
}
