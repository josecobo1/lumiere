import { Component, Input, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-modal-signin',
  templateUrl: './modal-signin.component.html',
  styleUrls: ['./modal-signin.component.scss'],
})
export class ModalSigninComponent implements OnInit {

  @Input() form: FormGroup;

  constructor(public modalController: ModalController) { }

  ngOnInit() {}

  dismissModal() {
    this.modalController.dismiss({
      dismiss: true
    });
  }

  onSubmit(){
    console.log(this.form.value);

    this.modalController.dismiss({
      dismiss: false,
      user: this.form.value
    });
  }

}
