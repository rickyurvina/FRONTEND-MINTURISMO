import { Component, OnInit } from '@angular/core';
import { ComponentService } from '../component.service';
import { Component as Comp } from '../component';
import { NzModalService } from 'ng-zorro-antd/modal';
import { TranslateService } from '@ngx-translate/core';
import { NzMessageService } from 'ng-zorro-antd/message';
import { CreateComponentsComponent } from '../create-components/create-components.component';
import { AuthenticationService } from 'src/app/shared/services/authentication.service';
import { TokenService } from 'src/app/shared/token.service';
import { AuthStateService } from 'src/app/shared/auth-state.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-index-components',
  templateUrl: './index-components.component.html',
  styleUrls: ['./index-components.component.css']
})
export class IndexComponentsComponent implements OnInit {

  components: Comp[] = [];
  size = 'large';
  isTranslated = false;

  constructor(public compService: ComponentService,
    private modalService: NzModalService,
    private message: NzMessageService,
    private translate: TranslateService,
    private auth: AuthStateService,
    public token: TokenService, private router: Router) {
  }

  ngOnInit(): void {
    try {
      this.compService.getAll().subscribe((data: Comp[]) => {
        this.components = data;
      }, err => {
        this.message.create('error', `Error: ${err}`);
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
            this.compService.destroy(id).subscribe(res => {
              this.components = this.components.filter(item => item.id !== id);
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
        nzTitle: id ? this.translate.instant('general.actualizar')+ ' ' + this.translate.instant('general.componente') : this.translate.instant('general.crear') + ' ' + this.translate.instant('general.componente'),
        nzContent: CreateComponentsComponent,
        nzFooter: null,
        nzComponentParams: {
          InputData: id,
          FormsData: this.components
        },
        nzWidth: '800px',
      });
      modal.afterClose.subscribe(() => this.ngOnInit());

    } catch (e) {
      this.message.create('error', `Error ${e}`);
    }
  }
}
