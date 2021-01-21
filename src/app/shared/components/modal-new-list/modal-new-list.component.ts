import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-modal-new-list',
  templateUrl: './modal-new-list.component.html',
  styleUrls: ['./modal-new-list.component.scss'],
})
export class ModalNewListComponent implements OnInit {

  constructor(public modalController: ModalController) { }

  ngOnInit() {}

  list: string = 'Lo que ven en Llinars del Vallés';

  dismiss() {
    this.modalController.dismiss({
      dismiss: false,
      list: {name: this.list, id: 88}
    });
  }

}
