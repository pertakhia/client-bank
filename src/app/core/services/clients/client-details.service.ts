import { inject, Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { forkJoin, map, Observable } from 'rxjs';
import { Client } from '../../interfaces/client';
import { Account } from '../../interfaces/account';

@Injectable({
  providedIn: 'root'
})
export class ClientDetailsService {
  public API_URL = environment.apiUrl;
  public http = inject(HttpClient);
  detailPath = '/clients';

  constructor() { }

  getClientDetails(clientId: number):Observable<Client|any> {
    return forkJoin({
      client: this.http.get<Client>(`${this.API_URL}${this.detailPath}/${clientId}`),
      accounts: this.http.get<Account>(`${this.API_URL}/accounts?clientId=${clientId}`)
    }).pipe(
      map(({ client, accounts }) => {
        return {
          ...client,
          accounts: accounts
        };
      })
    );
  }
}
