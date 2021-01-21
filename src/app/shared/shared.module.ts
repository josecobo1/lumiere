import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MoviePosterComponent } from './components/movie-poster/movie-poster.component';
import { ModalMovieDetailsComponent } from './components/modal-movie-details/modal-movie-details.component';
import { IonicModule } from '@ionic/angular';
import { PosterImgPipe } from './pipes/poster-img.pipe';
import { CastImageComponent } from './components/cast-image/cast-image.component';
import { MoviesByCastComponent } from './components/movies-by-cast/movies-by-cast.component';
import { ReactiveFormsModule } from '@angular/forms';
import { ModalSignupComponent } from './components/modal-signup/modal-signup.component';
import { ModalSigninComponent } from './components/modal-signin/modal-signin.component';
import { LoginSignupModalComponent } from './components/login-signup-modal/login-signup-modal.component';



@NgModule({
  declarations: [MoviePosterComponent, 
                 ModalMovieDetailsComponent, 
                 PosterImgPipe, 
                 CastImageComponent, 
                 MoviesByCastComponent, 
                 ModalSignupComponent, 
                 ModalSigninComponent,
                LoginSignupModalComponent],
  imports: [
    CommonModule,
    IonicModule.forRoot(),
    ReactiveFormsModule
  ],
  exports: [MoviePosterComponent, ModalMovieDetailsComponent, CastImageComponent]
})
export class SharedModule { }
