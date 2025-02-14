import { ResolveFn } from '@angular/router';
import { ClientDetailsService } from '../../services/clients/client-details.service';
import { inject } from '@angular/core';
import { catchError, of } from 'rxjs';
import { ErrorDialogComponent } from '../../../shared/component/error-dialog/error-dialog.component';
import { MatDialog } from '@angular/material/dialog';

export const clientDetailsResolver: ResolveFn<boolean> = (route, state) => {
  const clientService = inject(ClientDetailsService);
  const clientId = Number(route.params['clientId']);
  const dialog = inject(MatDialog);


  return clientService.getClientDetails(clientId).pipe(
    catchError(error => {
      // ერორის შემთხვევაში გააკეთე რაღაც (მაგალითად, შეინახე შეტყობინება ან გააჩერე დამტვირთავი ან ანიმაცია)
      console.error("Error loading client details:", error);
      
      // ის თუ მომხმარებელს უნდა დაეტყობინოს შეცდომა, ან გავუშვათ დიალოგი
      dialog.open(ErrorDialogComponent, {
        data: { message: `${error.error}  ${error.message}` }
      });

      return of(false);  // ან დაბრუნებ false ან ნებისმიერი შესაბამისი fallback მონაცემი
    })
  );


};
