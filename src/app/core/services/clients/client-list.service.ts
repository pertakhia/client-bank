import { inject, Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { forkJoin, map, Observable } from 'rxjs';
import { Client } from '../../interfaces/client';
import { Account } from '../../interfaces/account';

@Injectable({
  providedIn: 'root'
})
export class ClientListService {
  public API_URL = environment.apiUrl;
  public http = inject(HttpClient);
  clientPath = '/clients';
  accountPath = '/accounts';

  constructor() { }



  getClients(page: number, limit: number, searchTerm?: string, sortField?: string, sortOrder: 'asc' | 'desc' = 'asc'): Observable<{ clients: Client[], totalCount: number }> {
    const params: any = {
      _page: page.toString(),
      _limit: limit.toString(),
    };
  
    // თუ ფილტრის ველი არ არის ცარიელი, ვამატებთ `q` პარამეტრს (json-server ეძებს ყველა ველში)
    if (searchTerm) {
      params.q = searchTerm;
    }
  
    // თუ სორტირებისთვის ველი გადმოგვცეს, ვამატებთ `_sort` და `_order` პარამეტრებს
    if (sortField) {
      params._sort = sortField;
      params._order = sortOrder;
    }
  
    return forkJoin({
      clientsResponse: this.http.get<Client[]>(`${this.API_URL}${this.clientPath}`, {
        params,
        observe: 'response'
      }),
      accounts: this.http.get<Account[]>(`${this.API_URL}${this.accountPath}`)
    }).pipe(
      map(({ clientsResponse, accounts }) => {
        const clients = clientsResponse.body || [];
        const totalCount = Number(clientsResponse.headers.get('X-Total-Count')) || 0;
  
        // თითოეულ კლიენტს ვუმატებთ მის ანგარიშებს
        const enrichedClients = clients.map(client => ({
          ...client,
          accounts: accounts.filter(account => account.clientId === client.id)
        }));
  
        return { clients: enrichedClients, totalCount };
      })
    );
  }


  postClient(client: Client[]): Observable<any> {
    return this.http.post(`${this.API_URL}${this.clientPath}`, client);
  }

  deleteClient(clientId: number): Observable<any> {
    return this.http.delete(`${this.API_URL}${this.clientPath}/${clientId}`);
  }

  updateClient(client: Client): Observable<any> {
    return this.http.put(`${this.API_URL}${this.clientPath}/${client.id}`, client);
  }
  
}
