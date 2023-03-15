import { Injectable } from '@angular/core';
import { NzMessageService } from 'ng-zorro-antd/message';
import { environment } from 'src/environments/environment';
@Injectable({
  providedIn: 'root'
})
export class TokenService {

  private issuer = {
    login: environment.url+'/auth/login',
    register: environment.url+'/auth/register',
  };
  constructor(private messages: NzMessageService) {}
  handleData(token: any) {
    localStorage.setItem('auth_token', token);
  }
  getToken() {
    return localStorage.getItem('auth_token');
  }
  // Verify the token
  isValidToken() {
    const token = this.getToken();
    if (token) {
      const payload = this.payload(token);
      if (payload) {
        return Object.values(this.issuer).indexOf(payload.iss) > -1
          ? true
          : false;
      }
    } else {
      return false;
    }
  }
  payload(token: any) {
    try{
      const jwtPayload = token.split('.')[1];
      const returnValue= JSON.parse(atob(jwtPayload))
      return returnValue;
    }catch(e){
      localStorage.removeItem('auth_token')
      this.messages.create('error','Vuelva a iniciar sesión..');
    }

  }
  // User state based on valid token
  isLoggedIn() {
    return this.isValidToken();
  }
  // Remove token
  removeToken() {
    localStorage.removeItem('auth_token');
  }
}
