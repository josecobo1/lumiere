import { Component, OnInit } from '@angular/core';
import { ModalController, ToastController } from '@ionic/angular';
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
              public toastController: ToastController) { }

  upcomingMovies: UpcomingMovies;
  region: any;

  async ngOnInit() {

    console.log('ngOnInit');

    try {
      console.log('try region');
      this.region = await this.geolocationService.getCurrentLocation();
      console.log(this.region);
    } catch (error) {
      this.presentToast(`Can't get your current location`);
      console.log(error);
    }

    try {
      console.log('try upcoming movies');
      this.upcomingMovies = await this.moviesService.getUpcomingMovies$(this.region).pipe().toPromise();
      console.log(this.upcomingMovies);
    } catch (error) {
      this.presentToast(`Can't get the upcoming movie listfor your location, please try again later`);
      console.log(error);
    }

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
