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
  @Input() images: any;

  slideOpts = {
    initialSlide: 1,
    speed: 400,
    autoplay: {
      delay: 3000
    }
  }

  ngOnInit() {}

  dismissModal() {
    this.modalController.dismiss();
  }

}
