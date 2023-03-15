import { Component, OnInit } from '@angular/core';
import { SubTopic } from '../sub-topic';
import { SubTopicService } from '../sub-topic.service';
import { CreateSubTopicComponent } from '../create-sub-topic/create-sub-topic.component';
import { NzModalService } from 'ng-zorro-antd/modal';
import { NzMessageService } from 'ng-zorro-antd/message';
import { TranslateService } from '@ngx-translate/core';
import { TokenService } from 'src/app/shared/token.service';
import { AuthStateService } from 'src/app/shared/auth-state.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-index-sub-topic',
  templateUrl: './index-sub-topic.component.html',
  styleUrls: ['./index-sub-topic.component.css']
})
export class IndexSubTopicComponent implements OnInit {

  subTopics: SubTopic[] = [];
  size = 'large';
  isTranslated = false;
  constructor(public subTopicService: SubTopicService,
    private modalService: NzModalService,
    private message: NzMessageService,
    private translate: TranslateService,   private auth: AuthStateService,
    public token: TokenService, private router: Router) {
  }

  ngOnInit(): void {
    try {
      this.subTopicService.getAll().subscribe((data: SubTopic[]) => {
        this.subTopics = data;
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
            this.subTopicService.destroy(id).subscribe(res => {
              this.subTopics = this.subTopics.filter(item => item.id !== id);
              this.message.create('success', `Se ha eliminado correctamente`);
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
        nzTitle: id ? this.translate.instant('general.actualizar')+ ' ' + this.translate.instant('general.sub_tema') : this.translate.instant('general.crear') + ' ' + this.translate.instant('general.sub_tema'),
        nzContent: CreateSubTopicComponent,
        nzFooter: null,
        nzComponentParams: {
          InputData: id,
          FormsData: this.subTopics
        },
        nzWidth: '800px',
      });
      modal.afterClose.subscribe(() => this.ngOnInit());

    } catch (e) {
      this.message.create('error', `Error ${e}`);
    }
  }
}
