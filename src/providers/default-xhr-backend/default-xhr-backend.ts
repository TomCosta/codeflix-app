import { Injectable } from '@angular/core';
import {BrowserXhr, Request, Response, ResponseOptions, XHRBackend, XHRConnection, XSRFStrategy} from '@angular/http';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/catch';
import 'rxjs/add/observable/throw';
import { Observable } from "rxjs/Observable";
import {appContainer} from "../../app/app.container";
import {JwtClientProvider} from "../jwt-client/jwt-client";
import {RedirectorProvider} from "../redirector/redirector";


@Injectable()
export class DefaultXHRBackendProvider extends XHRBackend{//XmlHttpRequest

  constructor(
      public browserXHR: BrowserXhr,
      public baseResponseOptions: ResponseOptions,
      public xsfStrtegy: XSRFStrategy
  ) {
    super(browserXHR,baseResponseOptions,xsfStrtegy);
  }

  createConnection(request: Request): XHRConnection {
    let xhrConnection = super.createConnection(request);
    xhrConnection.response = xhrConnection
        .response
        .map((response) => {
         //salvar o token
          this.tokenSetter(response);
           return response;
        }).catch(responseError => {
            //verificar se o status 401 e redirecionar para o login
          this.unauthenticated(responseError);
          return Observable.throw(responseError);
        });
      return xhrConnection;
  }

  tokenSetter(response: Response){
    let jwtClient = appContainer().get(JwtClientProvider);
      if(response.headers.has('Authorization')){
        let authorization = response.headers.get('Authorization');
        let token = authorization.replace('Bearer ','');
        jwtClient.setToken(token);
      }
  }
  unauthenticated(responseError: Response){
     let redirector = appContainer().get(RedirectorProvider);
      if(responseError.status === 401){
         redirector.redirector();
      }
  }
}
