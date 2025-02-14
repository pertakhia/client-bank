import { inject, Injectable, signal } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { HttpClient } from '@angular/common/http';

export type LoginData = {
  email: string;
  password: string;
};

@Injectable({
  providedIn: 'root'
})
export class LoginService {
  public API_URL = environment.apiUrl;
  public http = inject(HttpClient);
  loginRouter = '/users';

  // ვქმნით სიგნალს, რომელიც ასახავს, შესულია თუ არა მომხმარებელი
  userAuthenticated = signal<boolean>(false);

  constructor() {
    this.loadToken(); // აქ ხდება localStorage-დან ტოკენის ჩატვირთვა
  }

  isLogged(): boolean {
    return this.userAuthenticated();
  }

  private saveToken(token: string): void {
    localStorage.setItem('token', token);
    this.userAuthenticated.set(true);
  }

  private loadToken(): void {
    const token = localStorage.getItem('token');
    if (token) {
      this.userAuthenticated.set(true);
    }
  }

  private generateToken(): string {
    return Math.random().toString(36).substring(2) + Math.random().toString(36).substring(2);
  }

  public login(data: LoginData): Observable<any> {
    return new Observable(observer => {
      this.http.get<any[]>(`${this.API_URL}${this.loginRouter}?email=${data.email}&password=${data.password}`).subscribe({
        next: users => {
          if (users.length > 0) {
            const token = this.generateToken();
            this.saveToken(token);
            observer.next({ success: true });
          } else {
            observer.next({ success: false });
          }
          observer.complete();
        },
        error: () => {
          observer.next({ success: false });
          observer.complete();
        }
      });
    });
  }

  public logout(): void {
    this.userAuthenticated.set(false);
    localStorage.removeItem('token');
  }

  public getToken(): string | null {
    return localStorage.getItem('token');
  }


}
