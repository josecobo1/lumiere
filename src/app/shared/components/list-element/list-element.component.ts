import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { Movie } from 'src/app/core/model/movies/movie';
import { MoviesService } from 'src/app/core/services/movies.service';
import { ModalMovieDetailsComponent } from '../modal-movie-details/modal-movie-details.component';

@Component({
  selector: 'app-list-element',
  templateUrl: './list-element.component.html',
  styleUrls: ['./list-element.component.scss'],
})
export class ListElementComponent implements OnInit {

  @Input() id: string;
  movie: Movie;

  constructor(public moviesService: MoviesService, public modalController: ModalController) { }

  async ngOnInit() {
    this.movie = await this.getMovieDetails(this.id);
  }

  async getMovieDetails(id): Promise<Movie> {
    return await this.moviesService.getMovieById(id).pipe().toPromise();
  }

  async getDetails() {

    const images = await this.moviesService.getMovieImages(this.id).pipe().toPromise();
    
    const modal = await this.modalController.create({
      component: ModalMovieDetailsComponent,
      componentProps: {
        movie: this.movie,
        images: images
      }
    });
    return await modal.present();
  }

}
