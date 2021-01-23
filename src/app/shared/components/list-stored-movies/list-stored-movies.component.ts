import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { first } from 'rxjs/operators';
import { GeolocationService } from 'src/app/core/services/geolocation.service';
import { ListsService } from 'src/app/core/services/lists.service';
import { MoviesService } from 'src/app/core/services/movies.service';
import { ModalMovieDetailsComponent } from '../modal-movie-details/modal-movie-details.component';

@Component({
  selector: 'app-list-stored-movies',
  templateUrl: './list-stored-movies.component.html',
  styleUrls: ['./list-stored-movies.component.scss'],
})
export class ListStoredMoviesComponent implements OnInit {

  @Input() listId: string;
  list;
  movies;
  region;
  
  constructor(public listsService: ListsService, 
              public movieService: MoviesService,
              public modalController: ModalController) { }

  async ngOnInit() {
    this.list = history.state;
    console.log(this.list); 
    this.movies = await this.listsService.getMoviesFromList(this.list.id);
  }

  async presentModal(movie) {
    let images;
    try {
      images = await this.movieService.getMovieImages(movie.id).pipe().toPromise();
    } catch (error) {
      images = [];
      console.log(`Esta película no tiene imagenes`);
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
