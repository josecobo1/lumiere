import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MoviePosterComponent } from './components/movie-poster/movie-poster.component';
import { ModalMovieDetailsComponent } from './components/modal-movie-details/modal-movie-details.component';
import { IonicModule } from '@ionic/angular';
import { PosterImgPipe } from './pipes/poster-img.pipe';



@NgModule({
  declarations: [MoviePosterComponent, ModalMovieDetailsComponent, PosterImgPipe],
  imports: [
    CommonModule,
    IonicModule
  ],
  exports: [MoviePosterComponent, ModalMovieDetailsComponent]
})
export class SharedModule { }
