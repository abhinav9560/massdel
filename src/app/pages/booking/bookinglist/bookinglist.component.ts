import { Component, OnInit } from '@angular/core';
import { NbComponentStatus, NbToastrService } from '@nebular/theme';
import { CommonService } from 'app/common.service';
import { BookingService } from '../booking.service';


@Component({
  selector: 'ngx-bookinglist',
  templateUrl: './bookinglist.component.html',
  styleUrls: ['./bookinglist.component.scss']
})
export class BookinglistComponent implements OnInit {
  statuses: NbComponentStatus[] = ['info'];
  items
  data: any = {
  }
  searchItem = {
    item: '',
  };
  dateRange = {
    start: '',
    end: ''
  }
  statusFilter = '8'
  duration = '2'
  constructor(private common: CommonService, private bookingservice: BookingService, private toastrService: NbToastrService) {
  }
  ngOnInit() {
    this.getUsers('1', '');
  }

  getUsers = async (pageNo, searchItem, dateRange?) => {
    this.common.showLoader()
    const UsersList = new FormData();
    UsersList.append('pageNo', pageNo);
    UsersList.append('size', '8');
    UsersList.append('searchItem', searchItem);
    if (dateRange) {
      UsersList.append('dateRange', JSON.stringify(dateRange));
    }
    if (this.statusFilter) {
      UsersList.append('statusFilter', this.statusFilter);
    }
    if (this.duration) {
      UsersList.append('duration', this.duration);
    }
    this.bookingservice.get(UsersList).subscribe((res) => {
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

  InactiveUser = async (Id, indexIs) => {

    if (confirm('Are you sure you want to Change status?')) {
      const newformData = new FormData();
      newformData.append('id', Id);
      await this.bookingservice.inactive(newformData).subscribe((response) => {
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

  ActiveUser = async (Id, indexIs) => {
    if (confirm('Are you sure you want to Change status?')) {

      const newformData = new FormData();
      newformData.append('id', Id);
      await this.bookingservice.active(newformData).subscribe((response) => {
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

  deleteUser = async (Id, Indexis) => {
    if (confirm('Are you sure you want to Delete user?')) {
      const newformData = new FormData();
      newformData.append('user_id', Id);

      await this.bookingservice.delete(newformData).subscribe((response) => {
        if (response['status'] == 1) {

          if (Indexis !== -1) {
            this.data.data.splice(Indexis, 1);
            this.toastrService.show('success', response['message'], { status: 'success' });
          } else {
            this.toastrService.show('success', response['message'], { status: 'danger' });
          }


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
    this.dateRange = { start: '', end: '' }
    this.searchItem = { item: '' }
    this.duration = '2'
    this.statusFilter = '8'
    this.ngOnInit()
  }
  filterChange(event) {
    this.getUsers(1, '',)
  }

  deleteBooking(id) {
    console.log(id)
    if (confirm('Are you sure?')) {
      const newformData = new FormData();
      newformData.append('id', id);
      this.bookingservice.deleteBooking(newformData).subscribe((response) => {
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

  cancleBooking(id) {
    if (confirm('Are you sure?')) {
      const newformData = new FormData();
      newformData.append('id', id);
      this.bookingservice.cancleBooking(newformData).subscribe((response) => {
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
}
