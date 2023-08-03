import { Component, OnInit } from '@angular/core';
import { CommonService } from 'app/common.service';
import { Router, ActivatedRoute } from '@angular/router';
import { NbToastrService } from '@nebular/theme';
import { FaqService } from '../faq.service';

@Component({
  selector: 'ngx-faqadd',
  templateUrl: './faqadd.component.html',
  styleUrls: ['./faqadd.component.scss']
})
export class FaqaddComponent implements OnInit {
  userData: any = {
    access: []
  }
  id

  constructor(private common: CommonService, private faqservice: FaqService, private router: Router, private routes: ActivatedRoute, private toastrService: NbToastrService) { }

  ngOnInit(): void {
    this.id = this.routes.snapshot.params.id;
    this.common.showLoader()
    if (this.id) {
      const newformData = new FormData();
      newformData.append('id', this.id);
      this.faqservice.getSingle(newformData).subscribe(res => {
        this.userData = res['data']
        this.common.hideLoader()
      })
    } else {
      this.common.hideLoader()
    }
  }

  userSubmit = async (formData) => {
  
    if(formData.question_english.trim().length<3){
      this.toastrService.show('error', 'Atleaset 3 character of Question (English)', { status: 'danger' });
      return
    }
    if(formData.question_aramaic.trim().length<3){
      this.toastrService.show('error', 'Atleaset 3 character of Question (Armaic)', { status: 'danger' });
      return
    }
    if(formData.answer_english.trim().length<3){
      this.toastrService.show('error', 'Atleaset 3 character of Answer (English)', { status: 'danger' });
      return
    }
    if(formData.answer_aramaic.trim().length<3){
      this.toastrService.show('error', 'Atleaset 3 character of Answer (Armaic)', { status: 'danger' });
      return
    }
    this.common.showLoader()
    if (!this.id) {
   
        const newformData = new FormData();
        newformData.append('question_english', formData.question_english.trim());
        newformData.append('question_aramaic', formData.question_aramaic.trim());
        newformData.append('answer_english', formData.answer_english.trim());
        newformData.append('answer_aramaic', formData.answer_aramaic.trim());
        this.faqservice.insert(newformData).subscribe((response) => {
          this.common.hideLoader()
          if (response['status'] == 1) {
            this.router.navigate(['faq']);
            this.toastrService.show('success', response['message'], { status: 'success' });
          } else {
            this.toastrService.show('error', response['message'], { status: 'danger' });
          }
        });
     
    }
    else {
   
        const newformData = new FormData();
        newformData.append('id', this.id);
        newformData.append('question_english', formData.question_english);
        newformData.append('question_aramaic', formData.question_aramaic);
        newformData.append('answer_english', formData.answer_english);
        newformData.append('answer_aramaic', formData.answer_aramaic);
        this.faqservice.update(newformData).subscribe((response) => {
          this.common.hideLoader()
          if (response['status'] == 1) {
            this.router.navigate(['faq/view', this.id]);
            this.toastrService.show('success', response['message'], { status: 'success' });
          } else {
            this.toastrService.show('success', response['message'], { status: 'danger' });
          }
        });
    

    }
  };

  goBack() {
    window.history.back()
  }
}
