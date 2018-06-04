import { NgModule } from '@angular/core';
import { HTTP_INTERCEPTORS } from '@angular/common/http';

// Angular2-Firebase
import { AngularFireModule } from 'angularfire2';
import { AngularFireDatabaseModule } from 'angularfire2/database';
import { FirebaseService } from "./firebase.service";
import { environment } from '../../../environments/environment';

// Interceptors
import { FirebaseInterceptor } from "./firebase.interceptor";

@NgModule({
  imports: [
    AngularFireModule.initializeApp(environment.firebase)
  ],
  exports: [
    AngularFireDatabaseModule
  ],
  providers: [ FirebaseService, { provide: HTTP_INTERCEPTORS, useClass: FirebaseInterceptor, multi: true } ]
})

export class FirebaseAccessModule { }