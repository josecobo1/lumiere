import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { MoviesByCastComponent } from './components/movies-by-cast/movies-by-cast.component';



const routes: Routes = [
  {
    path: '',
    component: MoviesByCastComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class UpcomingPageRoutingModule {}
