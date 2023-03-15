import { Component, OnInit } from '@angular/core';
import { FormService } from '../form.service';
import { Form } from '../form';
import { NzModalService } from 'ng-zorro-antd/modal';
import { CreateFormComponent } from '../create-form/create-form.component';
import { TranslateService } from '@ngx-translate/core';
import { NzMessageService } from 'ng-zorro-antd/message';
import { TokenService } from 'src/app/shared/token.service';
import { AuthStateService } from 'src/app/shared/auth-state.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-manage-forms',
  templateUrl: './manage-forms.component.html',
  styleUrls: ['./manage-forms.component.css']
})

export class ManageFormsComponent implements OnInit {
  forms: Form[] = [];
  size = 'large';
  isTranslated = false;
  constructor(public formService: FormService,
    private modalService: NzModalService,
    private message: NzMessageService,
    private translate: TranslateService,
    private auth: AuthStateService,
    public token: TokenService, private router: Router) {

  }

  ngOnInit(): void {
    try {
      this.formService.getAll().subscribe((data: Form[]) => {
        this.forms = data;
      }, err => {
        this.message.create('error', `Error: ${err.error.message}`);
        if(err.error.message=='Unauthenticated.'){
          this.signOut();
        }
      });
    } catch (e) {
      this.message.create('error', `Error ${e}`);
    }
  }

  signOut() {
    this.auth.setAuthState(false);
    this.token.removeToken();
    this.router.navigate(['login']);
  }

  showConfirm(id): void {
    try {
      this.modalService.confirm({
        nzTitle: this.translate.instant('general.seguro_desea_eliminar'),
        nzContent: this.translate.instant('general.modal_se_cierra'),
        nzOnOk: () => {
          try {
            this.formService.destroy(id).subscribe(res => {
              this.forms = this.forms.filter(item => item.id !== id);
              this.message.create('success', this.translate.instant('mensajes.eliminado_exitosamente'));
            }, err => {
              this.message.create('error', `Error: ${err}`);
            })
          } catch (e) {
            this.message.create('error', `Error: ${e}`);
          }
        }
      });
    } catch (e) {
      this.message.create('error', `Error ${e}`);
    }
  }

  showModalCreate(id = null) {
    try {
      const modal = this.modalService.create({
        nzTitle: id ? this.translate.instant('general.actualizar')+ ' ' + this.translate.instant('general.formulario') : this.translate.instant('general.crear') + ' ' + this.translate.instant('general.formulario'),
        nzContent: CreateFormComponent,
        nzComponentParams: {
          InputData: id,
          FormsData: this.forms
        },
        nzFooter: null,
        nzWidth: '800px',
      });
      modal.afterClose.subscribe(() => this.ngOnInit());
    } catch (e) {
      this.message.create('error', `Error ${e}`);
    }
  }
}
