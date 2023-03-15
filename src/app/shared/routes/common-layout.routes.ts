import { Routes } from '@angular/router';

export const CommonLayout_ROUTES: Routes = [

  //Questions
  {
    path: '',

    data: {
      title: 'Administración'
    },
    children: [
      {
        path: '',
        redirectTo: '/dashboard',
        pathMatch: 'full'
      },
      {
        path: '',
        loadChildren: () => import('../../questions/questions.module').then(m => m.QuestionsModule)
      },
    ]
  }
];
