import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'whereWatchCountry'
})
export class WhereWatchCountryPipe implements PipeTransform {

  transform(results: any, region: string): any {
    console.log(results.results[region]);
    return null;
  }

}
