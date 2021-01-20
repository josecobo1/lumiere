import { Component, Input, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-modal-signup',
  templateUrl: './modal-signup.component.html',
  styleUrls: ['./modal-signup.component.scss'],
})
export class ModalSignupComponent implements OnInit {

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
