import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { ModalMovieDetailsComponent } from '../modal-movie-details/modal-movie-details.component';

@Component({
  selector: 'app-movies-by-cast',
  templateUrl: './movies-by-cast.component.html',
  styleUrls: ['./movies-by-cast.component.scss'],
})
export class MoviesByCastComponent implements OnInit {

  cast: any;
  constructor(public modalController: ModalController) { }

  ngOnInit() {
    console.log(history.state.known_for);
    this.cast = history.state;
  }

  async presentModal(movie){
    const modal = await this.modalController.create({
      component: ModalMovieDetailsComponent,
      componentProps: {
        movie: movie
      }
    });

    return await modal.present();
  }

}
