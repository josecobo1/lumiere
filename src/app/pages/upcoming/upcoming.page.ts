import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { UpcomingMovies } from 'src/app/common/interfaces/movies/upcoming-movies';
import { GeolocationService } from 'src/app/common/services/geolocation.service';
import { MoviesService } from 'src/app/common/services/movies.service';
import { ModalMovieDetailsComponent } from 'src/app/shared/components/modal-movie-details/modal-movie-details.component';

@Component({
  selector: 'app-upcoming',
  templateUrl: './upcoming.page.html',
  styleUrls: ['./upcoming.page.scss'],
})
export class UpcomingPage implements OnInit {

  constructor(private moviesService: MoviesService, 
              public modalController: ModalController,
              public geolocationService: GeolocationService) { }

  upcomingMovies: UpcomingMovies;
  location: any;

  async ngOnInit() {
    this.upcomingMovies = await this.moviesService.getUpcomingMovies$().pipe().toPromise();
    console.log(this.upcomingMovies.results);
    this.geolocationService.getCurrentLocation();
  }

  getDetails(movie){
    console.log('modal', movie);
  }

  async presentModal(movie) {
    const modal = await this.modalController.create({
      component: ModalMovieDetailsComponent,
      componentProps: {
        movie: movie
      }
    });

    return await modal.present();
  }

}
