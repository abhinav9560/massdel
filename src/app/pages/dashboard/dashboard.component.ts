import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { CommonService } from 'app/common.service';
import { DashboardService } from './dashboard.service';
import { ChartDataSets, ChartOptions, ChartType } from 'chart.js';
import { Label } from 'ng2-charts';

@Component({
  selector: 'ngx-dashboard',
  styleUrls: ['./dashboard.component.scss'],
  templateUrl: './dashboard.component.html',
})
export class DashboardComponent implements OnInit {
  year = new Date().getFullYear()
  userData: any = {}
  yearArray = []
  showGraph = false
  public barChartOptions: ChartOptions = {
    responsive: true,
    scales: { xAxes: [{}], yAxes: [{}] },
    plugins: {
      datalabels: {
        anchor: 'end',
        align: 'end',
      }
    }
  };

  public barChartLabels: Label[] = ["January", "February", "March", "April", "May", "June", "July",
    "August", "September", "October", "November", "December"];
  public barChartType: ChartType = 'bar';
  public barChartLegend = true;


  public barChartData: ChartDataSets[] = [
    { data: [], label: 'Customer' },
    { data: [], label: 'Provider' },
    { data: [], label: 'Booking' },
  ];


  constructor(private common: CommonService, private dashboardservice: DashboardService, private ref: ChangeDetectorRef) {
  }

  ngOnInit() {
    let temp = new Date().getFullYear()
    for (let index = 0; index < 11; index++) {
      this.yearArray.push(temp)
      temp--
    }
    this.common.showLoader()
    this.barChartData = [
      { data: [], label: 'Customer' },
      { data: [], label: 'Provider' },
      { data: [], label: 'Booking' },
    ];
    this.getGraph()
  }

  // events
  public chartClicked({ event, active }: { event: MouseEvent, active: {}[] }): void {
    console.log(event, active);
  }

  public chartHovered({ event, active }: { event: MouseEvent, active: {}[] }): void {
    console.log(event, active);
  }

  getGraph() {
    this.dashboardservice.get().subscribe((res) => {
      this.userData = res['data']
      const data = new FormData();
      data.append('year', this.year.toString());
      this.dashboardservice.getChartData(data).subscribe((response) => {
        response['data'].customerData.forEach(element => {
          this.barChartData[0].data.push(element['users'])
        });
        response['data'].providerData.forEach(element => {
          this.barChartData[1].data.push(element['users'])
        });
        response['data'].bookingData.forEach(element => {
          this.barChartData[2].data.push(element['users'])
        });
        this.showGraph = true
        this.ref.detectChanges()
        this.common.hideLoader()
      })
    })
  }

  yearChange() {
    this.ngOnInit()
  }

}
