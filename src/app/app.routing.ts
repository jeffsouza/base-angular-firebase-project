import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

let ROUTES = [
  //Routes here
]

@NgModule({
  imports: [RouterModule.forRoot(ROUTES)],
  exports: [RouterModule]
})

export class AppRouting {}