import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ListStoredMoviesComponent } from 'src/app/shared/components/list-stored-movies/list-stored-movies.component';
import { MoviesByCastComponent } from 'src/app/shared/components/movies-by-cast/movies-by-cast.component';

import { TabsPage } from './tabs.page';

const routes: Routes = [
  {
    path: 'tabs',
    component: TabsPage,
    children: [
      {
        path: 'upcoming',
        loadChildren: () => import('./../../pages/upcoming/upcoming.module').then( m => m.UpcomingPageModule)
      },
      {
        path: 'search',
        children: [
          {
            path: '',
            loadChildren: () => import('./../../pages/search/search.module').then( m => m.SearchPageModule)
          },
          {
            path: 'cast',
            component: MoviesByCastComponent
          } 
        ]
      },
      {
        path: 'profile',
        children: [
          {
            path: '',
            loadChildren: () => import('./../../pages/profile/profile.module').then( m => m.ProfilePageModule)
          },
          {
            path: 'lists/details',
            component: ListStoredMoviesComponent
          }
        ]
      }
    ]
  },
  {
    path: '',
    redirectTo: 'tabs/upcoming',
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TabsPageRoutingModule {}
