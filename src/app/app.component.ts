import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { TokenService } from './shared/token.service';
import { AuthStateService } from './shared/auth-state.service';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html'
})

export class AppComponent {


  constructor(
    private auth: AuthStateService,
    public router: Router,
    public token: TokenService
  ) {}

  ngOnInit() {

  }

}
