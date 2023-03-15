import { Component, OnInit, Input } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { ComponentService } from '../component.service';
import { NzModalService } from 'ng-zorro-antd/modal';
import { Router } from '@angular/router';
import { IndexComponentsComponent } from '../index-components/index-components.component';
import { Component as Comp } from '../component';
import { NzMessageService } from 'ng-zorro-antd/message';
import { TranslateService } from '@ngx-translate/core';
import { Observable, Observer } from 'rxjs';

@Component({
  selector: 'app-create-components',
  templateUrl: './create-components.component.html',
  styleUrls: ['./create-components.component.css']
})
export class CreateComponentsComponent implements OnInit {

  @Input() InputData: any;
  @Input() FormsData: any;

  codes: string[] = [];
  id: number;
  comp: Comp;
  validateForm: FormGroup;

  constructor(private fb: FormBuilder,
    private compService: ComponentService,
    private modalService: NzModalService,
    private router: Router,
    private indexComponents: IndexComponentsComponent,
    private message: NzMessageService,
    private translate: TranslateService) {

    this.validateForm = this.fb.group({
      code: ['', [Validators.required], [this.codeAsyncValidator]],
      name: ['', [Validators.required]],
      description: ['', []],
    });
  }

  public ngOnInit(): void {
    this.codes = [];

    if (this.InputData) {
      this.id = this.InputData;
      this.compService.find(this.id).subscribe((data: Comp) => {
        this.comp = data;
        this.validateForm.setValue({
          name: this.comp.name,
          code: this.comp.code,
          description: this.comp.description,
        })
        this.codes = this.FormsData.map(element => {
          return element['code'] != this.comp.code;
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

  submitForm(value: { code: string; name: string; }): void {
    if (this.InputData) {
      try {
        this.compService.update(this.id, value).subscribe(res => {
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
        this.compService.create(value).subscribe(res => {
          for (const key in this.validateForm.controls) {
            if (this.validateForm.controls.hasOwnProperty(key)) {
              this.validateForm.controls[key].markAsDirty();
              this.validateForm.controls[key].updateValueAndValidity();
            }
          }
          this.message.create('success', this.translate.instant('mensajes.creado_exitosamente'));
          this.modalService.closeAll();
          this.indexComponents.ngOnInit();
          this.router.navigate(['admin/manage-components'])
        }, err => {
          this.showErrors(err)
        });
      } catch (e) {
        this.message.create('error', `Error ${e}`);
      }
    }
    // this.router.navigateByUrl('forms/manage-forms')
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
