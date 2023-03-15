import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router'
import { AuthService } from 'src/app/services/auth.service';
import { TokenService } from 'src/app/shared/token.service';
import { NzMessageService } from 'ng-zorro-antd/message';
import { AuthStateService } from 'src/app/shared/auth-state.service';

@Component({
  selector: 'app-login-form',
  templateUrl: './login-form.component.html',
  styleUrls: ['./login-form.component.css']
})
export class LoginFormComponent implements OnInit {

  loginForm: FormGroup;

  constructor(private fb: FormBuilder,
    private router: Router,
    private authService: AuthService,
    private token: TokenService,
    private authState: AuthStateService,
    private message: NzMessageService,
    private tokenService:TokenService) {
    this.loginForm = this.fb.group({
      email: [null, [Validators.required, Validators.pattern("[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,3}$")]],
      password: [null, [Validators.required]]
    });
    if(this.tokenService.isLoggedIn()){
      this.router.navigate(['/admin/manage-questions']);
    }

  }

  ngOnInit(): void {

  }
  submitForm(): void {

    try{
      this.authService.signin(this.loginForm.value).subscribe(
        (result) => {
          this.responseHandler(result);
          for (const i in this.loginForm.controls) {
            this.loginForm.controls[i].markAsDirty();
            this.loginForm.controls[i].updateValueAndValidity();
          }
        },
        (error) => {
          console.log(error.error.error)
          this.message.create('error', `Lo siento, pero no se han encontrado tus credenciales en nuestra base de datos. Por favor, verifica si has ingresado la información correctamente`);
        },
        () => {
          this.authState.setAuthState(true);
          this.loginForm.reset();
          this.router.navigate(['/admin/manage-questions']);
        }
      );
    }catch(e){
      this.message.create('error', `Error al autenticar`);
    }
  }
  // Handle response
  responseHandler(data: any) {
    this.token.handleData(data.access_token);
  }
}
