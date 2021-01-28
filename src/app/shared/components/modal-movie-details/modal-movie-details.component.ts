import { Router } from '@angular/router';
import { first } from 'rxjs/operators';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ActionSheetController, AlertController, LoadingController, ModalController, NavController, ToastController } from '@ionic/angular';
import { ListsService } from 'src/app/core/services/lists.service';
import { UserService } from 'src/app/core/services/user.service';
import { LoginSignupModalComponent } from '../login-signup-modal/login-signup-modal.component';
import { v4 as uuidv4 } from 'uuid';
import * as moment from 'moment';
import { AuthService } from 'src/app/core/services/auth.service';

@Component({
  selector: 'app-modal-movie-details',
  templateUrl: './modal-movie-details.component.html',
  styleUrls: ['./modal-movie-details.component.scss'],
})
export class ModalMovieDetailsComponent implements OnInit {

  @Input() isLogged: boolean;
  @Input() movie: any;
  @Input() images: any;
  @Input() user: any;
  @Input() collections: any;
  @Input() cast: any;
  @Input() platforms: any;
  @Input() isSaved: boolean;
  @Input() isSeen: boolean;
  @Input() actionsSheetOptionns: any;
  region = 'ES';

  @Output() seen = new EventEmitter();

  constructor(public modalController: ModalController,
              public userService: UserService,
              public actionSheetController: ActionSheetController,
              public listsService: ListsService,
              public toastController: ToastController,
              public alertController: AlertController,
              public authService: AuthService,
              public router: Router,
              private navCtrl: NavController) { }
  
  ngOnInit(){
    console.log(this.isSaved, this.isSeen);
    console.log('Platforms', this.platforms.results[this.region]);
  }

  // Opciones para el slider de imagenes de la película
  slideOpts = {
        initialSlide: 1,
        speed: 400,
        autoplay: {
          delay: 3000
        }
      }

  // Cierra el modal
  dismissModal(){
    this.modalController.dismiss();
  }

  // Guarda como vista
  async setSeen() {
    // Reviso si ha iniciado sesión, sinó muestro modal para iniciar sesión
    if(this.isLogged) {
      // Reviso si ha visto la pelicula
      if(this.isSeen){
        const result = await this.userService.removeMovieFromSeen(this.user.id, this.movie.id);
        this.toast('Movie removed as seen');
        this.isSeen ? this.isSeen = false : this.isSeen = true;
      } else {
        const result = await this.userService.addMovieToSeen(this.user.id, this.movie.id);
        this.toast('Movie marked as seen');
        this.isSeen ? this.isSeen = false : this.isSeen = true;
      }
    } else {
      // Muestro modal para iniciar sesión
      this.loginSignup();
    }
  }

  // Guarda como ver después
  async setSave() {
    if(this.isLogged) {
      if(this.isSaved) {
        const result = await this.userService.removeMovieFromSeeLater(this.user.id, this.movie.id);
        this.toast('Movie removed from saved');
        this.isSaved ? this.isSaved = false : this.isSaved = true;
      } else {
        const result = await this.userService.addMovieToSeeLater(this.user.id, this.movie.id);
        this.toast('Movie added to saved');
        this.isSaved ? this.isSaved = false : this.isSaved = true;
      }
    } else {
      // Muestro modal para iniciar sesión
      this.loginSignup();
    }
  }

  // Genera opciones para el action sheet del modal
  generateActionSheetOptions(collections: any) {
    const options = collections.map(c => {
      return {
        text: c.name,
        handler: () => {
          this.saveIntoColletcion(c.id);
        }
      }
    });
    return options;
  }

  // Añade a una colección
  async addToCollection() {

    const options = this.generateActionSheetOptions(this.collections);

    if(this.isLogged){
      const actionSheet = await this.actionSheetController.create({
        buttons: [
          {
            text: 'New collection',
            handler: () => {
              this.alert();
            }
          },
          ...options,
          {
            text: 'Cancel',
            role: 'cancel'
          }
        ]
      });
      actionSheet.present();
    } else {
      // Mostrar modal de login
      this.loginSignup();
    }
  }

  // Añadir película a una colección
  async saveIntoColletcion(collectionId) {
    const result = await this.listsService.addMovieToList(this.movie.id, collectionId);
    if(result){
      this.toast('Movie added to the collection');
    } else {
      this.toast('This movie is already in this collection');
    }
  }

  async toast(message){
    const toast = await this.toastController.create({
      message: message,
      duration: 500
    });
    toast.present();
  }

  // Nueva colección
  async newCollection(collectionName) {

    // Objeto que representa la coleccion
    const collection = {
      id: uuidv4(),
      owner: this.user.id,
      name: collectionName,
      movies: [],
      createdAt: moment().format('MMMM Do YYYY, h:mm:ss a'),
      updatedAt: moment().format('MMMM Do YYYY, h:mm:ss a')
    }

    // Guardo la colección en firebase
    this.listsService.createNewList(collection);

    const result = await this.userService.addListToUser(this.user.id, collection.id);

    if(result){
      this.saveIntoColletcion(collection.id);
    } else {
      this.toast('Something went wrong try later');
    }
  }

  // Alert para nombrar a la nueva colección
  async alert(){
    const alert = await this.alertController.create({
      header: 'New collection',
      inputs: [
        {
          name: 'newCollection',
          type: 'text',
          placeholder: 'New collection'
        }
      ],
      buttons: [
        {
          text: 'Close',
          role: 'cancel'
        },
        {
          text: 'Create',
          handler: (data) => {
            this.newCollection(data.newCollection);
          }
        }
      ]
    });
    await alert.present();
  }

  async loginSignup() {
    const modal = await this.modalController.create({
      component: LoginSignupModalComponent
    });

    await modal.present();

    // const { data } = await modal.onWillDismiss();

    modal.onDidDismiss().then(async data => {
      this.isLogged = await this.authService.isLogged();
      if(this.isLogged) {
        const uid = await this.authService.getUserId();
        this.user = await this.userService.getUser(uid).pipe(first()).toPromise();
        this.isSeen = this.user.seen.some(s => s.movie == this.movie.id);
        this.isSaved = this.user.saved.some(s => s.movie == this.movie.id);
        this.collections = await this.listsService.getUserOwnedLists(uid).pipe(first()).toPromise();
        
        // Genera opciones del actionsheet
        this.actionsSheetOptionns = this.generateActionSheetOptions(this.collections);
      }
    })     
    
  }

  getCast(c){
    console.log(c);
    // this.navCtrl.navigateForward(['tabs/search/cast', c]);
  }

  }
