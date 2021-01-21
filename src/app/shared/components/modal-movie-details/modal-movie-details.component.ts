import { Component, Input, OnInit } from '@angular/core';
import { ActionSheetController, ModalController } from '@ionic/angular';
import { Movie } from 'src/app/core/model/movies/movie';
import { AuthService } from 'src/app/core/services/auth.service';
import { UserService } from 'src/app/core/services/user.service';
import { LoginSignupModalComponent } from '../login-signup-modal/login-signup-modal.component';

@Component({
  selector: 'app-modal-movie-details',
  templateUrl: './modal-movie-details.component.html',
  styleUrls: ['./modal-movie-details.component.scss'],
})
export class ModalMovieDetailsComponent implements OnInit {

  constructor(public modalController: ModalController, 
              public auth: AuthService, 
              public userService: UserService,
              public actionSheetController: ActionSheetController) { }

  @Input() movie: Movie;
  @Input() images: any;
  
  // Comprueva si el usuario ha iniciado sesión, en caso contrario muestra el modal para iniciar sesión
  async isUserLogged(){
    const state = await this.auth.isLogged();

    if(state == null) {
      this.presentModal();
      return false;
    } else {
      return true;
    }
    
  }

  async presentModal(){
    const modal = await this.modalController.create({
      component: LoginSignupModalComponent,
    });

    return await modal.present();
  }

  async setAsSeen(){

    // Si el usuario ha inicido sesión guardamos la película como vista, en caso contrario la función isLogged 
    // mostrará el modal de inicio de sesión
    if(await this.isUserLogged()){
      // Recupero el uid del usuario de la base de datos
      const userUid = await this.auth.getUserId(); 

      // Uso uid el usuario e id de la película para añadir la pelilcula a vistas
      await this.userService.addMovieToSeen(userUid, this.movie.id);
    } 
     
  }

  async setAsToSee(){

    if(await this.isUserLogged()) {
      // Recupero el uid del usuario de la base de datos
      const userUid = await this.auth.getUserId(); 

      // Uso uid el usuario e id de la película para añadir la pelilcula a vistas
      await this.userService.addMovieToSeeLater(userUid, this.movie.id);
    }
    
  }

  saveIntoList(movieId){
    alert(movieId);
  }

  async addToList(){
    
    if(await this.isUserLogged()){
      const actionSheet = await this.actionSheetController.create({
        buttons: [
          {
            text: 'New list',
            handler: ()  => {
              this.saveIntoList(this.movie.id);
            }
          }
        ]
      });
      await actionSheet.present();
    }

    
  }

  // Opciones para el slide de imagenes
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
