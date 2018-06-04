import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpResponse } from "@angular/common/http";
import { Observable } from "rxjs/Observable";
import { of } from "rxjs/observable/of";
import { Injectable } from "@angular/core";
import { FirebaseService } from "./firebase.service";

import 'rxjs/add/operator/switchMap';
import 'rxjs/add/operator/map';


@Injectable()

export class FirebaseInterceptor implements HttpInterceptor {

  constructor(private firebaseService: FirebaseService) { }

  sendRequest(request, resourceName: string, resourceID: string, queryString: string): Observable<any> {
    const resourceHash = {};

    if (request.body) {
      let resource = request.body;
      Object.keys( resource ).forEach (k => { resourceHash[k] = resource[k] });
    }
    
    if (request.method == 'GET') {
      const formattedQueryString = this.queryStringAsHash(queryString); 
      return this.firebaseService.getResource(resourceName, resourceID, formattedQueryString);
    } else if (request.method == 'PUT') {
      return this.firebaseService.putResource(resourceName, resourceHash);
    } else if (request.method == 'POST') {
      return this.firebaseService.postResource(resourceName, resourceHash);
    } else if (request.method == 'DELETE') {
      const resourceID = request.url.split('/')[4];
      return this.firebaseService.deleteResource(resourceName, resourceID);
    }

  }

  validate(body: string, resourceName: string): Promise<any> {
    let result = null;

    return import(`./validators/${resourceName}.validator`)
      .then(result => {
        let validatorClassName = this.validatorClassName(resourceName);
        return new result[validatorClassName]().validate(body);
      });

  }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const urlParts = req.url.split('/');
    let [resourceName, queryString] = urlParts[3].split('?');
    let resourceID = urlParts[4];

    return of(new HttpResponse())
      .switchMap((httpResponse: HttpResponse<any>) => {
        return this.validate(req.body, resourceName);
      })
      .switchMap((errorsList) => {
        let isErrors = Object.keys(errorsList['errors']).length > 0;
        let errorsResponse = null;
        if (isErrors)
          errorsResponse = new HttpResponse({ status: 500, body: errorsList });
        return isErrors ? of(errorsResponse) : this.sendRequest(req, resourceName, resourceID, queryString);
      })
      .map(response => {
        return response;
      })

  }

  validatorClassName(resourceName): string {
    return `${resourceName.charAt(0).toUpperCase() + resourceName.slice(1)}Validator`;
  }

  queryStringAsHash(queryString): {} {
    if (!queryString) return null;
    let filters = queryString.split('&');
    let result = {};

    filters.forEach(filter => {
      const [key, value] = filter.split('=');
      result[key] = value;
    });

    return result;
  }

}