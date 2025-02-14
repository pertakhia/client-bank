import { Component, DestroyRef, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ClientDetailsService } from '../../../../services/clients/client-details.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Subject, takeUntil } from 'rxjs';
import { CommonModule, NgFor, NgIf } from '@angular/common';
import { Client } from '../../../../interfaces/client';
import { MatIcon } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { MatDialog } from '@angular/material/dialog';
import { ErrorDialogComponent } from '../../../../../shared/component/error-dialog/error-dialog.component';
@Component({
  selector: 'app-client-details',
  imports: [CommonModule, RouterLink, MatIcon, MatButtonModule, MatProgressSpinner],
  templateUrl: './client-details.component.html',
  styleUrl: './client-details.component.scss'
})
export class ClientDetailsComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  private destroyRef = inject(DestroyRef);
  private route = inject(ActivatedRoute);
  private dialog = inject(MatDialog);

  public clientDetails = signal(<Client>{});
  public isLoading = signal(false);

  constructor() { }

  ngOnInit() {


    this.route.data.pipe(takeUntil(this.destroy$)).subscribe(
      {
        next: (data: any) => {
          if (data.clientDetails) {
            this.clientDetails.set(data.clientDetails);
            this.isLoading.set(false);
          } else {
            this.isLoading.set(true);
          }
        },
        error: (error) => {
          console.log(error);
          this.dialog.open(ErrorDialogComponent, {
            data: { message: `${error.error}  ${error.message}` }
          });
        }
      }
    );

  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }


}
