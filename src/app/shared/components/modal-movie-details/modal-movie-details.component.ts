import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { Movie } from 'src/app/core/model/movies/movie';

@Component({
  selector: 'app-modal-movie-details',
  templateUrl: './modal-movie-details.component.html',
  styleUrls: ['./modal-movie-details.component.scss'],
})
export class ModalMovieDetailsComponent implements OnInit {

  constructor(public modalController: ModalController) { }

  @Input() movie: Movie;

  ngOnInit() {}

  dismissModal() {
    this.modalController.dismiss();
  }

}
