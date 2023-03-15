import { Component } from '@angular/core';
import { ThemeConstantService } from '../../services/theme-constant.service';
import { TranslateService } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { TokenService } from '../../token.service';
import { AuthStateService } from '../../auth-state.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html'
})

export class HeaderComponent {

  searchVisible: boolean = false;
  quickViewVisible: boolean = false;
  isFolded: boolean;
  isExpand: boolean;
  isTranslated = false;

  constructor(private themeService: ThemeConstantService,
    private translate: TranslateService,
    private auth: AuthStateService,
    public router: Router,
    public token: TokenService) {
    translate.addLangs(['es', 'en']);
    translate.setDefaultLang('es');
  }

  ngOnInit(): void {
    this.themeService.isMenuFoldedChanges.subscribe(isFolded => this.isFolded = isFolded);
    this.themeService.isExpandChanges.subscribe(isExpand => this.isExpand = isExpand);
  }

  toggleFold() {
    this.isFolded = !this.isFolded;
    this.themeService.toggleFold(this.isFolded);
  }

  toggleExpand() {
    this.isFolded = false;
    this.isExpand = !this.isExpand;
    this.themeService.toggleExpand(this.isExpand);
    this.themeService.toggleFold(this.isFolded);
  }

  searchToggle(): void {
    this.searchVisible = !this.searchVisible;
  }

  quickViewToggle(): void {
    this.quickViewVisible = !this.quickViewVisible;
  }

  useLanguage(language: string) {
    this.translate.use(language);
    if (language == 'es') {
      this.isTranslated = false;
    } else {
      this.isTranslated = true;
    }
  }

  // Signout
  signOut() {
    this.auth.setAuthState(false);
    this.token.removeToken();
    this.router.navigate(['login']);
  }
}
