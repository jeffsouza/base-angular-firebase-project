import { Injectable } from '@angular/core';
import { of } from "rxjs/observable/of";

import { AngularFireDatabase, AngularFireList } from 'angularfire2/database';
import { Observable } from 'rxjs/Observable';
import { HttpResponse } from '@angular/common/http';

@Injectable()

export class FirebaseService {
  public objs: AngularFireList<any[]>;

  constructor(private db: AngularFireDatabase) { }

  getResource(resourceName: string, resourceID: string, queryString: {}): Observable<HttpResponse<any>> {
    let response = null;

    if (queryString)
      response = this.getWithQueryString(resourceName, queryString);
    else if (resourceID)
      response = this.getById(resourceName, resourceID);
    else
      response = this.getWithoutQueryString(resourceName);
    
    return response;
  }

  postResource(resourceName: string, resource: {}): Observable<HttpResponse<any>> {
    
    this.db.list(resourceName).push(resource);

    return of(new HttpResponse({ status: 200, body: resource }));
  }

  putResource(resourceName: string, resource: any): Observable<HttpResponse<any>> {
    
    const resourceID = resource['id'];
    delete resource['id'];
    
    this.db.list(resourceName).update(resourceID, resource);

    return of(new HttpResponse({ status: 200, body: resource }));
  }

  deleteResource(resourceName: string, resourceID: string): Observable<HttpResponse<any>> {

    this.db.list(resourceName).remove(resourceID);

    return of(new HttpResponse({ status: 200, body: {'success': true} }));
  }



  private getWithQueryString(resourceName: string, queryString: {}): Observable<HttpResponse<any>[]> {

    const keys = Object.keys(queryString);
    const firstFilterKey = keys[0];
    const firstFilterValue = queryString[firstFilterKey];
    delete queryString[firstFilterKey];

    return this.db.list(resourceName, ref => ref.orderByChild(firstFilterKey).equalTo(firstFilterValue)).snapshotChanges()
      .map(items => {
        
        return items.filter(item => {
          let values = item.payload.val();
          let result = true;

          for(let key in queryString) {
            result = values[key] == queryString[key];
          }
          return result;
        });

      }).map(items => {
        return items.map(item => {
          const id = item.key;
          const data = item.payload.val();
          return new HttpResponse({ status: 200, body: { id, ...data } });
        })
      });

  }

  private getById(resourceName: string, resourceID: string): Observable<HttpResponse<any>> {

    return this.db.object(`${resourceName}/${resourceID}`).snapshotChanges()
      .map(item => {
        const id = item.key;
        const data = item.payload.val();
        if (id)
          return new HttpResponse({ status: 200, body: { id, ...data } });
        else
          return new HttpResponse({ status: 404, body: {} });
      })

  }

  private getWithoutQueryString(resourceName: string): Observable<HttpResponse<any[]>> {

    return this.db.list(resourceName).snapshotChanges()
      .map(items => {
        return items.map(item => {
          const id = item.key;
          const data = item.payload.val();
          return { id, ...data };
        })
      })
      .map(items => {
        return new HttpResponse({ status: 200, body: items });
      });

  }

}