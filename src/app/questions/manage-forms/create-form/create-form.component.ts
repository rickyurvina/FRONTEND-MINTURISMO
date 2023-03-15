import { Component, OnInit, Input } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { Observable, Observer } from 'rxjs';
import { FormService } from '../form.service';
import { NzModalService } from 'ng-zorro-antd/modal';
import { ManageFormsComponent } from '../index/manage-forms.component';
import { Form } from '../form';
import { NzMessageService } from 'ng-zorro-antd/message';
import { TranslateService } from '@ngx-translate/core';
import { Component as Comp } from '../../manage-components/component';
import { ComponentService } from '../../manage-components/component.service';

@Component({
  selector: 'app-create-form',
  templateUrl: './create-form.component.html',
  styleUrls: ['./create-form.component.css']
})

export class CreateFormComponent implements OnInit {

  @Input() InputData: any;
  @Input() FormsData: any;

  codes: string[] = [];
  id: number;
  form: Form;
  validateForm: FormGroup;
  components: Comp[] = [];
  statusForms: string[] = [];

  optionList = [
    { label: 'Activo', value: 'Activo' },
    { label: 'Inactivo', value: 'NoActivo' }
  ];

  constructor(private fb: FormBuilder,
    private formService: FormService,
    private modalService: NzModalService,
    private manageForms: ManageFormsComponent,
    private message: NzMessageService,
    private translate: TranslateService,
    private componentService: ComponentService) {

    this.validateForm = this.fb.group({
      code: ['', [Validators.required], [this.codeAsyncValidator]],
      name: ['', [Validators.required]],
      description: ['', []],
      status: new FormControl(''),
      selectedComponents: new FormControl()
    });
  }

  public ngOnInit(): void {
    this.codes = [];

    if (this.InputData) {
      this.id = this.InputData;
      this.formService.find(this.id).subscribe((data: Form) => {
        this.form = data;
        this.validateForm.setValue({
          name: this.form.name,
          code: this.form.code,
          description: this.form.description,
          status:this.form.status,
          selectedComponents: this.form.components.map(function (value) {
            return value['id'];
          })
        })
        this.codes = this.FormsData.map(element => {
          return element['code'] != this.form.code;
        })
        if (this.form.status !== 'Activo') {
          this.statusForms = this.FormsData.filter(element => {
            return element['status'] === 'Activo';
          })
        }

      }, err => {
        this.message.create('error', `Error: ${err}`);
      });
    } else {
      this.codes = this.FormsData.map(element => {
        return element['code'];
      })
      this.statusForms = this.FormsData.filter(element => {
        return element['status'] === 'Activo';
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

  }

  submitForm(value: { code: string; name: string; status: string }): void {

    if (this.InputData) {
      try {
        this.formService.update(this.id, value).subscribe(res => {
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
        this.formService.create(value).subscribe(res => {
          for (const key in this.validateForm.controls) {
            if (this.validateForm.controls.hasOwnProperty(key)) {
              this.validateForm.controls[key].markAsDirty();
              this.validateForm.controls[key].updateValueAndValidity();
            }
          }
          this.message.create('success', this.translate.instant('mensajes.creado_exitosamente'));
          this.modalService.closeAll();
          this.manageForms.ngOnInit();
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
