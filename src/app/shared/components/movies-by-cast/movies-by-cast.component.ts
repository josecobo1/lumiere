import { Component, OnInit } from '@angular/core';
import { LoadingController, ModalController } from '@ionic/angular';
import { MoviesService } from 'src/app/core/services/movies.service';
import { ModalMovieDetailsComponent } from '../modal-movie-details/modal-movie-details.component';

@Component({
  selector: 'app-movies-by-cast',
  templateUrl: './movies-by-cast.component.html',
  styleUrls: ['./movies-by-cast.component.scss'],
})
export class MoviesByCastComponent implements OnInit {

  cast: any;
  constructor(public modalController: ModalController, private movieService: MoviesService, public loadingContoller: LoadingController) { }

  ngOnInit() {
    console.log(history.state.known_for);
    this.cast = history.state;
  }

  async presentModal(movie){

    let images;

    const loading = await this.loadingContoller.create({
      message: 'Loading',
      translucent: true
    });

    await loading.present();

    try {
      images = await this.movieService.getMovieImages(movie.id).pipe().toPromise();
    } catch (error) {
      images = [];
      console.log(`Esta película no tiene imagenes`);
    } finally {
      loading.dismiss();
    }

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
