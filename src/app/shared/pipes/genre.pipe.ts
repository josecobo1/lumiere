import { Pipe, PipeTransform } from '@angular/core';
import { Genre } from 'src/app/core/interfaces/genres';
import { MoviesService } from 'src/app/core/services/movies.service';

@Pipe({
  name: 'genre'
})
export class GenrePipe implements PipeTransform {

  constructor(public movieService: MoviesService){}

  async transform(genre: number): Promise<string> {

    const genresList = await this.movieService.getGenresList().pipe().toPromise();
    console.log(genre);
    const result = genresList.genres.filter(function(g){
      console.log(typeof(g.id));
      return g.id == genre
    });
    console.log(result);
    return result[0].name;
  }

}
