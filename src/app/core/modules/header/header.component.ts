import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import { RouterLink, RouterModule } from '@angular/router';
import { ClientListComponent } from '../clients/client-list/client-list.component';
import { LoginService } from '../../services/auth/login.service';
@Component({
  selector: 'app-header',
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    RouterModule,
    RouterLink,
  
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent implements OnInit {
  authService = inject(LoginService);


  ngOnInit() {
   
  }
}
