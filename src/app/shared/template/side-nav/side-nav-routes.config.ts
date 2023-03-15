import { SideNavInterface } from '../../interfaces/side-nav.type';

export const ROUTES: SideNavInterface[] = [

  {
    path: '',
    title: 'Administración',
    iconType: 'nzIcon',
    iconTheme: 'outline',
    icon: 'setting',
    submenu: [
      {
        path: '/admin/manage-forms',
        title: 'Formularios',
        iconType: '',
        icon: '',
        iconTheme: '',
        submenu: []
      },
      {
        path: '/admin/manage-components',
        title: 'Componentes',
        iconType: '',
        icon: '',
        iconTheme: '',
        submenu: []
      },
      {
        path: '/admin/manage-sub-topics',
        title: 'SubTemas',
        iconType: '',
        icon: '',
        iconTheme: '',
        submenu: []
      },

      {
        path: '/admin/manage-questions',
        title: 'Preguntas',
        iconType: '',
        icon: '',
        iconTheme: '',
        submenu: []
      },
      {
        path: '/admin/manage-establishments',
        title: 'Establecimientos',
        iconType: '',
        icon: '',
        iconTheme: '',
        submenu: []
      },
      {
        path: '/admin/manage-results',
        title: 'Resultados',
        iconType: '',
        icon: '',
        iconTheme: '',
        submenu: []
      },

    ]
  }
]
