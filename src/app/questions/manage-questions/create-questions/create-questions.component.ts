import { Component, OnInit, Input } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { Observable, Observer } from 'rxjs';
import { Question } from '../question';
import { QuestionService } from '../question.service';
import { NzModalService } from 'ng-zorro-antd/modal';
import { Router } from '@angular/router';
import { IndexQuestionsComponent } from '../index-questions/index-questions.component';
import { NzMessageService } from 'ng-zorro-antd/message';
import { TranslateService } from '@ngx-translate/core';
import { EstablishmentType } from 'src/app/test-form/establishment-type';
import { EstablishmentTypeService } from 'src/app/test-form/establishment-type.service';
@Component({
  selector: 'app-create-questions',
  templateUrl: './create-questions.component.html',
  styleUrls: ['./create-questions.component.css']
})
export class CreateQuestionsComponent implements OnInit {
  @Input() InputData: any;
  @Input() FormsData: any;

  codes: string[] = [];
  id: number;
  question: Question;
  questions: Question[] = [];
  validateForm: FormGroup;
  validateFormRelated: FormGroup;
  isCollapse = true;
  questionsRelated: any[] = [];
  establishmentTypes: EstablishmentType[] = [];
  optionList = [
    { label: 'Si/No', value: 'si_no' },
    { label: 'Rango 1-5', value: 'rango_1_5' },
    { label: 'Rango 1-5 N/A', value: 'rango_1_5_na' },
    { label: 'Relacionada', value: 'relacionada' },
    { label: 'Informativa', value: 'informativa' },

  ];

  optionList2 = [
    { label: 'Si/No', value: 'si_no' },
    { label: 'Rango 1-5', value: 'rango_1_5' },
    { label: 'Rango 1-5 N/A', value: 'rango_1_5_na' },
    { label: 'Multiple', value: 'multiple' },
    { label: 'Una Opción', value: 'una_opcion' },
    { label: 'Frecuencia de Actualización', value: 'frecuencia_actualizacion' },

  ];

  constructor(private fb: FormBuilder,
    private questionService: QuestionService,
    private modalService: NzModalService,
    private router: Router,
    private indexQuestions: IndexQuestionsComponent,
    private message: NzMessageService,
    private translate: TranslateService,
    private establishmentTypeService: EstablishmentTypeService
  ) {

    this.validateForm = this.fb.group({
      code: ['', [Validators.required], [this.codeAsyncValidator]],
      name: ['', [Validators.required]],
      type: ['', [Validators.required]],
      description: ['', []],
      children_type: ['', []],
      establishmentTypes: new FormControl(),
      children: new FormControl(),
      dependents: new FormControl(),
      dependentQ: new FormControl(),
      importance: new FormControl(),
      verificationMeans: new FormControl(),
      hasScore: new FormControl(),
      answerRequired:new FormControl()
    });

    this.validateFormRelated = this.fb.group({
      name: ['', [Validators.required]],
      value: ['', []],
    });
  }

  public ngOnInit(): void {
    this.codes = [];
    this.questions = this.FormsData.map(element => {
      return element;
    })

    /*get establishment types*/
    try {
      this.establishmentTypeService.getAll().subscribe((data: EstablishmentType[]) => {
        this.establishmentTypes = data;
      }, err => {
        this.message.create('error', `Error: ${err}`);
      });
    } catch (e) {
      this.message.create('error', `Error ${e}`);
    }

    if (this.InputData) {
      this.id = this.InputData;
      this.questionService.find(this.id).subscribe((data: Question) => {
        this.question = data;
        console.log(this.question)
        this.validateForm.setValue({
          name: this.question.name,
          code: this.question.code,
          type: this.question.type,
          description: this.question.description,
          children_type: this.question.children_type,
          children: this.question.children,
          dependentQ: this.question['question_dependents'].length>0 ? 'si' : 'no',
          importance:  this.question.importance,
          verificationMeans:  this.question.verification_means,
          establishmentTypes: this.question['establishment_types'].map(function (value) {
            return value['id'];
          }),
          dependents: this.question['question_dependents'].map(function (value) {
            return value['id'];
          }),
          hasScore:this.question.has_score,
          answerRequired:this.question.answer_required
        })

        this.questionsRelated = data.children
        this.codes = this.FormsData.map(element => {
          return element['code'] != this.question.code;
        })
      }, err => {
        this.message.create('error', `Error: ${err}`);
      });
    } else {
      this.codes = this.FormsData.map(element => {
        return element['code'];
      })
    }
  }

  submitForm(value: {
    code: string;
    name: string;
    type: string;
    description: string;
    questionsRelated: any[],
    children_type: string,
    dependent: number,
    establishmentTypes:any[],
    importance:string,
    verificationMeans:string,
    answerRequired:string
  }): void {
    if (this.InputData) {
      try {
        value.questionsRelated = this.questionsRelated
        this.questionService.update(this.id, value).subscribe(res => {
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
        value.questionsRelated = this.questionsRelated
        this.questionService.create(value).subscribe(res => {
          for (const key in this.validateForm.controls) {
            if (this.validateForm.controls.hasOwnProperty(key)) {
              this.validateForm.controls[key].markAsDirty();
              this.validateForm.controls[key].updateValueAndValidity();
            }
          }
          this.message.create('success', this.translate.instant('mensajes.creado_exitosamente'));
          this.modalService.closeAll();
          this.indexQuestions.ngOnInit();
          this.router.navigate(['admin/manage-questions'])
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

  resetFormRelated(): void {
    this.validateFormRelated.reset();
  }

  submitFormRelated(value: { name: string; value: string }): void {
    for (const i in this.validateFormRelated.controls) {
      this.validateFormRelated.controls[i].markAsDirty();
      this.validateFormRelated.controls[i].updateValueAndValidity();
    }
    this.questionsRelated.push(value);
    this.resetFormRelated();
  }

  deleteItemQuestionsRelated(name) {
    this.questionsRelated = this.questionsRelated.filter(item => item.name !== name)
  }
}
