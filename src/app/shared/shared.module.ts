import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MoviePosterComponent } from './components/movie-poster/movie-poster.component';
import { ModalMovieDetailsComponent } from './components/modal-movie-details/modal-movie-details.component';
import { IonicModule } from '@ionic/angular';
import { PosterImgPipe } from './pipes/poster-img.pipe';
import { CastImageComponent } from './components/cast-image/cast-image.component';
import { MoviesByCastComponent } from './components/movies-by-cast/movies-by-cast.component';



@NgModule({
  declarations: [MoviePosterComponent, ModalMovieDetailsComponent, PosterImgPipe, CastImageComponent, MoviesByCastComponent],
  imports: [
    CommonModule,
    IonicModule
  ],
  exports: [MoviePosterComponent, ModalMovieDetailsComponent, CastImageComponent]
})
export class SharedModule { }
