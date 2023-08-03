import { Component, OnDestroy, OnInit, Inject } from '@angular/core';
import { NbMediaBreakpointsService, NbMenuService, NB_WINDOW, NbSidebarService, NbThemeService } from '@nebular/theme';
import { UserData } from '../../../@core/data/users';
import { LayoutService } from '../../../@core/utils';
import { map, takeUntil, filter } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { NavigationEnd, Router } from '@angular/router';
import { CommonService } from 'app/common.service';

@Component({
  selector: 'ngx-header',
  styleUrls: ['./header.component.scss'],
  templateUrl: './header.component.html',
})
export class HeaderComponent implements OnInit, OnDestroy {

  private destroy$: Subject<void> = new Subject<void>();
  userPictureOnly: boolean = false;
  user: any;
  notificationData = []
  showDot = false
  currentTheme = 'default';
  openBox1 = false
  userMenu = [{ title: 'Profile' }, { title: 'Change Password' }, { title: 'Log out' }];

  constructor(private sidebarService: NbSidebarService,
    private menuService: NbMenuService,
    private nbMenuService: NbMenuService,
    private userService: UserData,
    private layoutService: LayoutService,
    @Inject(NB_WINDOW) private window,
    private router: Router,
    private common: CommonService
  ) {

    this.router.events.subscribe((ev) => {
      if (ev instanceof NavigationEnd) { 
        this.getNotification()
      }
    });
  }

  ngOnInit() {
    this.user = JSON.parse(localStorage.getItem('user_data'))

    this.nbMenuService.onItemClick()
      .pipe(
        filter(({ tag }) => tag === 'my-context-menu'),
        map(({ item: { title } }) => title),
        takeUntil(this.destroy$)
      )

      .subscribe(title => {
        if (title == 'Log out') {
          console.log('Log out')
          this.logOut()
        }
        if (title == 'Change Password') {
          this.router.navigate(['change-password'])
        }
        if (title == 'Profile') {
          this.router.navigate(['profile'])
        }
      });

  
  }

  openBox(){
     this.openBox1 = !this.openBox1
     this.getNotification()
     this.readNotification()
  }

  getNotification(){
      // get notification
      this.showDot = false
      this.common.getNotification({}).subscribe((res) => {
        // console.log(res['data'])
        this.notificationData = res['data']
        this.notificationData.forEach(element => {
          if (!element.isRead) {
            this.showDot = true
          }
        });
      })
  }

  readNotification() {
    this.common.readNotification({}).subscribe((res) => {
    })
  }

  logOut() {
    if (confirm('Are you sure?')) {
      localStorage.clear()
      this.router.navigate(['login'])
    } else {
      return false;
    }

  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  showbox() {
    console.log('show box')
  }

  toggleSidebar(): boolean {
    this.sidebarService.toggle(true, 'menu-sidebar');
    this.layoutService.changeLayoutSize();

    return false;
  }

  navigateHome() {
    this.menuService.navigateHome();
    return false;
  }

  goTo(){
    this.router.navigate(['/dashboard'])
  }
}
