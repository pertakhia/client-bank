import { inject, Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Account } from '../../interfaces/account';

@Injectable({
  providedIn: 'root'
})
export class AccountsService {
  public API_URL = environment.apiUrl;
  public http = inject(HttpClient);
  accountPath = '/accounts';

  constructor() { }


  postAccount(account: Account): Observable<Account> {
    return this.http.post<Account>(`${this.API_URL}${this.accountPath}`, account);
  }

  updateAccount(account: any): Observable<any> {
    return this.http.put(`${this.API_URL}${this.accountPath}/${account.id}`, account);
  }

  deleteAccount(accountId: number): Observable<any> { 
    return this.http.delete(`${this.API_URL}${this.accountPath}/${accountId}`);
  }
}
