import { Component, OnInit, Input } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { Observable, Observer, BehaviorSubject } from 'rxjs';
import { SubTopic } from '../sub-topic';
import { SubTopicService } from '../sub-topic.service';
import { NzModalService } from 'ng-zorro-antd/modal';
import { Router } from '@angular/router';
import { IndexSubTopicComponent } from '../index-sub-topic/index-sub-topic.component';
import { NzMessageService } from 'ng-zorro-antd/message';
import { TranslateService } from '@ngx-translate/core';
import { ComponentService } from '../../manage-components/component.service';
import { Component as Comp } from '../../manage-components/component';
import { Question } from '../../manage-questions/question';
import {
  QuestionService
} from '../../manage-questions/question.service';
import { element } from 'protractor';

@Component({
  selector: 'app-create-sub-topic',
  templateUrl: './create-sub-topic.component.html',
  styleUrls: ['./create-sub-topic.component.css']
})

export class CreateSubTopicComponent implements OnInit {

  @Input() InputData: any;
  @Input() FormsData: any;

  codes: string[] = [];
  id: number;
  subTopic: SubTopic;
  validateForm: FormGroup;
  components: Comp[] = [];
  questions: Question[] = [];

  constructor(private fb: FormBuilder,
    private subTopicService: SubTopicService,
    private modalService: NzModalService,
    private router: Router,
    private indexSubTopics: IndexSubTopicComponent,
    private message: NzMessageService,
    private translate: TranslateService,
    private componentService: ComponentService,
    private questionService: QuestionService,
 ) {

    this.validateForm = this.fb.group({
      code: ['', [Validators.required], [this.codeAsyncValidator]],
      name: ['', [Validators.required]],
      component_id: ['', [Validators.required]],
      description: ['', []],
      selectedQuestions: new FormControl()
    });
  }

  public ngOnInit(): void {
    this.codes = [];
    if (this.InputData) {
      this.id = this.InputData;
      this.subTopicService.find(this.id).subscribe((data: SubTopic) => {
        this.subTopic = data;
        this.validateForm.setValue({
          name: this.subTopic.name,
          code: this.subTopic.code,
          description: this.subTopic.description,
          component_id: this.subTopic.component_id,
          selectedQuestions:this.subTopic.questions.map(function (value) {
            return  value['id'];
         })
        })
        this.codes = this.FormsData.map(element => {
          return element['code'] != this.subTopic.code;
        })
      }, err => {
        this.message.create('error', `Error: ${err}`);
      });
    } else {
      this.codes = this.FormsData.map(element => {
        return element['code'];
      })
    }

    try {
      this.componentService.getAll().subscribe((data: Comp[]) => {
        this.components = data;
      }, err => {
        this.message.create('error', `Error: ${err}`);
      });
    } catch (e) {
      this.message.create('error', `Error ${e}`);
    }

    try {
      this.questionService.getAll().subscribe((data: Question[]) => {
        this.questions = data;
      }, err => {
        this.message.create('error', `Error: ${err}`);
      });
    } catch (e) {
      this.message.create('error', `Error ${e}`);
    }
  }


  submitForm(value: { code: string; name: string}): void {
    if (this.InputData) {
      try {
        this.subTopicService.update(this.id, value).subscribe(res => {
          for (const key in this.validateForm.controls) {
            if (this.validateForm.controls.hasOwnProperty(key)) {
              this.validateForm.controls[key].markAsDirty();
              this.validateForm.controls[key].updateValueAndValidity();
            }
          }
          this.message.create('success', this.translate.instant('mensajes.actualizado_exitosamente'));
          this.modalService.closeAll();
        }, err => {
          this.showErrors(err)
        });
      } catch (e) {
        this.message.create('error', `Error ${e}`);
      }
    } else {
      try {
        this.subTopicService.create(value).subscribe(res => {
          for (const key in this.validateForm.controls) {
            if (this.validateForm.controls.hasOwnProperty(key)) {
              this.validateForm.controls[key].markAsDirty();
              this.validateForm.controls[key].updateValueAndValidity();
            }
          }
          this.message.create('success', this.translate.instant('mensajes.creado_exitosamente'));
          this.modalService.closeAll();
          this.indexSubTopics.ngOnInit();
          this.router.navigate(['admin/manage-sub-topics'])
        }, err => {
          this.showErrors(err)
        });
      } catch (e) {
        this.message.create('error', `Error ${e}`);
      }
    }
  }

  resetForm(e: MouseEvent): void {
    e.preventDefault();
    this.validateForm.reset();
    for (const key in this.validateForm.controls) {
      if (this.validateForm.controls.hasOwnProperty(key)) {
        this.validateForm.controls[key].markAsPristine();
        this.validateForm.controls[key].updateValueAndValidity();
      }
    }
  }

  showErrors(err) {
    const messagesArr = [];
    if (err.error) {
      messagesArr.push(err.error.message);
      if (err.error.errors) {
        for (const property in err.error.errors) {
          if (err.error.errors.hasOwnProperty(property)) {
            const propertyErrors: Array<string> = err.error.errors[property];
            propertyErrors.forEach(error => messagesArr.push(error));
          }
        }
      }
    }
    messagesArr.forEach(element => {
      this.message.create('error', `${element}`)
    });
  }

  codeAsyncValidator = (control: FormControl) =>
    new Observable((observer: Observer<ValidationErrors | null>) => {
      setTimeout(() => {
        if (this.codes.includes(control.value)) {
          observer.next({ error: true, duplicated: true });
        } else {
          observer.next(null);
        }
        observer.complete();
      }, 1000);
    });

}
