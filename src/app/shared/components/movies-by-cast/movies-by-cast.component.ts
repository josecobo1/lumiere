import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { MoviesService } from 'src/app/core/services/movies.service';
import { ModalMovieDetailsComponent } from '../modal-movie-details/modal-movie-details.component';

@Component({
  selector: 'app-movies-by-cast',
  templateUrl: './movies-by-cast.component.html',
  styleUrls: ['./movies-by-cast.component.scss'],
})
export class MoviesByCastComponent implements OnInit {

  cast: any;
  constructor(public modalController: ModalController, private movieService: MoviesService) { }

  ngOnInit() {
    console.log(history.state.known_for);
    this.cast = history.state;
  }

  async presentModal(movie){

    const images = await this.movieService.getMovieImages(movie.id).pipe().toPromise();
    console.log(images);

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
