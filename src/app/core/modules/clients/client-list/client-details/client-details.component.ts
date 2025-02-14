import { Component, DestroyRef, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ClientDetailsService } from '../../../../services/clients/client-details.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Subject, takeUntil } from 'rxjs';
import { CommonModule, NgFor, NgIf } from '@angular/common';
import { Client } from '../../../../interfaces/client';
import { MatIcon } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
@Component({
  selector: 'app-client-details',
  imports: [ CommonModule, RouterLink, MatIcon, MatButtonModule ],
  templateUrl: './client-details.component.html',
  styleUrl: './client-details.component.scss'
})
export class ClientDetailsComponent implements OnInit , OnDestroy {
  private destroy$ = new Subject<void>();
  private destroyRef = inject(DestroyRef);
  private route = inject(ActivatedRoute);
  private clientService = inject(ClientDetailsService);

  public clientDetails = signal(<Client>{});
  public isLoading = signal(false);

  constructor() { }

  ngOnInit() {
    this.route.params.pipe(takeUntil(this.destroy$)).subscribe(params => {

      const clientId = Number(params['clientId']);

      this.clientService.getClientDetails(clientId)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe((client) => {
          console.log(client);
          this.clientDetails.set(client);
          this.isLoading.set(false);
        });
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }


}
