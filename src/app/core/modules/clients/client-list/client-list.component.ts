import { Component, DestroyRef, inject, OnInit, signal, ViewChild } from '@angular/core';
import { Client } from '../../../interfaces/client';
import { ClientListService } from '../../../services/clients/client-list.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NgFor, NgIf } from '@angular/common';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatTableModule } from '@angular/material/table';
import { ActivatedRoute, Params, Router, RouterLink } from '@angular/router';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { ConfirmDialogComponent } from '../../../../shared/component/confirm-dialog/confirm-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { trigger, state, style, transition, animate, keyframes } from '@angular/animations';
import { ErrorDialogComponent } from '../../../../shared/component/error-dialog/error-dialog.component';
@Component({
  selector: 'app-client-list',
  imports: [
    NgFor, MatPaginatorModule, MatTableModule, MatSortModule, MatInputModule, MatSelectModule, MatButtonModule, MatIcon, RouterLink
  ],
  templateUrl: './client-list.component.html',
  styleUrl: './client-list.component.scss',
  animations: [
      trigger('fadeInOut', [
        // landing page animation
         state('void', style({
            opacity: 1,
            transform: 'translateX(0)'
          })),
          // transition from void to any state
          // * => * is a wildcard
          transition('void => *',
          // animate for 1 second
          animate('0.6s', 
          // keyframes for animation
          keyframes([
            // rotate 0 at 0%
            style({ opacity: 0, transform: 'translateY(24px)', offset: 0}),
            // rotate 0 at 50%
            style({ opacity: 1, transform: 'translateY(0)', offset: 1}),
          ]))),
  
      ]),
    ]
})
export class ClientListComponent implements OnInit {
  clientService = inject(ClientListService);
  clientsList = signal([] as Client[]);
  destroyRef = inject(DestroyRef);
  dialog = inject(MatDialog);
  route = inject(ActivatedRoute);
  router = inject(Router);
  expandedRow: number | null = null;
  totalClients = signal(0);
  pageSize = signal(10);
  currentPage = signal(1);
  searchTerm = signal('');
  sortField = signal('firstName');
  sortOrder = signal<'asc' | 'desc'>('asc');

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  ngOnInit() {
    this.route.queryParams.subscribe((params: Params) => {
      const page = Number(params['page']) || 1;
      const pageSize = Number(params['pageSize']) || 10;
      const search = params['searchTerm'] || '';
      const sortField = params['sortField'] || 'firstName';
      const sortOrder = params['sortOrder'] || 'asc';

      this.currentPage.set(page);
      this.pageSize.set(pageSize);
      this.searchTerm.set(search);
      this.sortField.set(sortField);
      this.sortOrder.set(sortOrder);

      this.loadClients();
    });
  }


  loadClients() {
    this.clientService.getClients(this.currentPage(), this.pageSize(), this.searchTerm(), this.sortField(), this.sortOrder())
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          this.clientsList.set(response.clients);
          this.totalClients.set(response.totalCount);
        },
        error: (error) => {
          console.error('Error loading clients:', error);
          this.dialog.open(ErrorDialogComponent, {
            data: { message: `${error.error}  ${error.message}` }
          });
        },
      });
  }

  onPageChange(event: any) {
    const newPage = event.pageIndex + 1;
    const newSize = event.pageSize;

    this.currentPage.set(newPage);
    this.pageSize.set(newSize);

    // Query Params-ის განახლება (URL-ი შეიცვლება, მონაცემები დარჩება)
    this.router.navigate([], {
      queryParams: { page: newPage, pageSize: newSize },
      queryParamsHandling: 'merge', // სხვა query params-ები არ წაიშლება
    });

    this.loadClients();
  }


  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value.trim().toLowerCase();
    this.searchTerm.set(filterValue);

    // Query Params-ის განახლება (ფილტრის მონაცემები URL-შიც დარჩება)
    this.router.navigate([], {
      queryParams: { searchTerm: filterValue, page: 1 },
      queryParamsHandling: 'merge',
    });

    this.loadClients();
  }

  onSortChange(sortField: string, sortOrder: 'asc' | 'desc') {
    this.sortField.set(sortField);
    this.sortOrder.set(sortOrder);

    // Query Params-ის განახლება
    this.router.navigate([], {
      queryParams: { sortField, sortOrder },
      queryParamsHandling: 'merge',
    });

    this.loadClients();
  }

  resetFilters() {
    this.searchTerm.set('');
    this.sortField.set('firstName');
    this.sortOrder.set('asc');
    this.currentPage.set(1);
    this.pageSize.set(10);

    this.router.navigate([], {
      queryParams: {},
      queryParamsHandling: 'merge',
    });

    this.loadClients();
  }


  // დეტალური ინფორმაციის გამოსაჩენად გადამისამართეთ კლიენტის გვერდზე

  onViewDetails(clientId: number) {
    this.router.navigate(['clients', clientId]);
  }



  // წაშლის ღილაკი 
  onDeleteClient(clientId: number) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: { message: 'დარწმუნებული ხარ, რომ გინდა კლიენტის წაშლა?' },
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.clientService.deleteClient(clientId)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe(() => {
          console.log('კლიენტი წაიშალა');
          this.loadClients();
        });
      }
    });

  }

  // კლიენტის რედაქტირების ფუნქცია
  onEditClient(clientId: number) {
    this.router.navigate(['edit-clients', clientId]);
  }
}
