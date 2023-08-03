import { Component, OnInit } from '@angular/core';
import { CommonService } from 'app/common.service';
import { Router, ActivatedRoute } from '@angular/router';
import { NbToastrService } from '@nebular/theme';
import { ServiceproviderService } from '../serviceprovider.service';


@Component({
  selector: 'ngx-bank-account',
  templateUrl: './bank-account.component.html',
  styleUrls: ['./bank-account.component.scss']
})
export class BankAccountComponent implements OnInit {
  id: String = ''
  data: []
  constructor(private common: CommonService, private providerService: ServiceproviderService, private router: Router, private routes: ActivatedRoute, private toastrService: NbToastrService) {

    this.id = this.routes.snapshot.params.id;
  }

  ngOnInit(): void {
    this.providerService.getBankAccounts(this.id).subscribe(res => {
      this.data = res['data']
    })
  }

}
