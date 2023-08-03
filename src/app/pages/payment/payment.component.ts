import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonService } from 'app/common.service';

@Component({
  selector: 'ngx-payment',
  templateUrl: './payment.component.html',
  styleUrls: ['./payment.component.scss']
})
export class PaymentComponent implements OnInit {

  constructor(private router: Router, private routes: ActivatedRoute, private common: CommonService) { }

  ngOnInit(): void {
    console.log(this.routes.snapshot)
    this.common.hideLoader()
  }

}
