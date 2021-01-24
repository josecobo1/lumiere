import { Component, OnInit } from '@angular/core';
import { LoadingController, ModalController, ToastController } from '@ionic/angular';
import { UpcomingMovies } from 'src/app/core/model/movies/upcoming-movies';
import { GeolocationService } from 'src/app/core/services/geolocation.service';
import { MoviesService } from 'src/app/core/services/movies.service';
import { ModalMovieDetailsComponent } from 'src/app/shared/components/modal-movie-details/modal-movie-details.component';

@Component({
  selector: 'app-upcoming',
  templateUrl: './upcoming.page.html',
  styleUrls: ['./upcoming.page.scss'],
})
export class UpcomingPage implements OnInit {

  constructor(private moviesService: MoviesService, 
              public modalController: ModalController,
              public geolocationService: GeolocationService,
              public toastController: ToastController,
              public loadingController: LoadingController) { }

  upcomingMovies: UpcomingMovies;
  region: any;

  async ngOnInit() {

    try {
      const loading = await this.loadingController.create({
        message: 'Loading',
        translucent: true
      });

      await loading.present();

      await this.getRegion();
      await this.getUpcomingMovies();

      loading.dismiss();
      
    } catch (error) {
      this.presentToast('Oops somethign went wrong please try later');
    }

  }

  async getRegion(){
    this.region = await this.geolocationService.getCurrentLocation();
  }

  async getUpcomingMovies() {
    this.upcomingMovies = await this.moviesService.getUpcomingMovies$(this.region).pipe().toPromise();
  }

  async presentToast(message){
    const toast = await this.toastController.create({
      message: message,
      duration: 4000,
      translucent: true
    });

    toast.present();
  }

  getDetails(movie){
    console.log('modal', movie);
  }

  async presentModal(movie) {

    const images = await this.moviesService.getMovieImages(movie.id).pipe().toPromise();
    console.log('fotos de la peli', images);

    const modal = await this.modalController.create({
      component: ModalMovieDetailsComponent,
      componentProps: {
        movie: movie,
        images: images
      }
    });

    return await modal.present();
  }

}
