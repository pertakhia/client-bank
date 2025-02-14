import { Component, DestroyRef, effect, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, FormGroup, Validators, FormArray, ReactiveFormsModule } from '@angular/forms';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { Subject, takeUntil, switchMap, catchError, tap, throwError, of } from 'rxjs';
import { ErrorDialogComponent } from '../../../../shared/component/error-dialog/error-dialog.component';
import { SuccessDialogComponent } from '../../../../shared/component/success-dialog/success-dialog.component';
import { AccountsService } from '../../../services/accounts/accounts.service';
import { ClientListService } from '../../../services/clients/client-list.service';
import { NgIf, NgFor, CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatIcon } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { AccountFormComponent } from '../../accounts/account-form/account-form.component';
import { ActivatedRoute } from '@angular/router';
import { ClientDetailsService } from '../../../services/clients/client-details.service';

@Component({
  selector: 'app-client-update',
  imports: [MatButtonModule, MatInputModule,
    MatSelectModule, MatCardModule, ReactiveFormsModule,
    NgIf, NgFor, MatDividerModule, MatIcon, CommonModule,
    AccountFormComponent,
    MatDialogModule],
  templateUrl: './client-update.component.html',
  styleUrl: './client-update.component.scss'
})
export class ClientUpdateComponent {
  private formBuilder = inject(FormBuilder);
  private dialog = inject(MatDialog);
  public clientService = inject(ClientListService);
  public accountService = inject(AccountsService);
  public clientDetailService = inject(ClientDetailsService);
  private route = inject(ActivatedRoute);
  allowEditMap: { [key: number]: boolean } = {};
  allowOnCancelMap: { [key: number]: boolean } = {};
  originalAccounts: { [key: number]: any } = {};
  allowSaveMap: { [key: number]: boolean } = {};


  clientForm!: FormGroup;
  genders = signal(['კაცი', 'ქალი']);
  selectedPhoto: string | ArrayBuffer | null = null; // Base64 ფოტოს შენახვა
  clientId = signal(''); // კლიენტის ID
  private destroy$ = new Subject<void>();
  destroyRef = inject(DestroyRef);
  addAccountButtonDisabled = signal(false);



  constructor() {

    this.realoadClient();





    this.clientForm = this.formBuilder.group({
      clientId: ['', [Validators.required, Validators.pattern(/^\d+$/)]],
      firstName: ['', [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(50),
        Validators.pattern(/^(?:[ა-ჰ]+|[a-zA-Z]+)$/)
      ]],
      lastName: ['', [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(50),
        Validators.pattern(/^(?:[ა-ჰ]+|[a-zA-Z]+)$/)
      ]],
      gender: ['', Validators.required],
      personalNumber: ['', [Validators.required, Validators.pattern(/^\d{11}$/)]],
      phoneNumber: ['', [Validators.required, Validators.pattern(/^5\d{8}$/)]],
      legalAddress: this.formBuilder.group({
        country: ['', Validators.required],
        city: ['', Validators.required],
        street: ['', Validators.required]
      }),
      actualAddress: this.formBuilder.group({
        country: ['', Validators.required],
        city: ['', Validators.required],
        street: ['', Validators.required]
      }),
      photo: [null, Validators.required],
      // იმ შემთხვევისთვის არის მასივი თუ ერთზე მეტი ანგარიშის დამატება მოგვინდა თავიდან
      // თუ დაზუსტებით მეცოდინებოდა რომ ეს იქნებოდა ერთხელ მაშინ გამოვიყენებდი აქაც ჩვეულებრივ FormGroup-ს
      accounts: this.formBuilder.array([]),
    });

    // თუ მომხმარებელი ხელით ცვლის clientId-ს, მაშინ განახლდეს signal
    this.clientForm.get('clientId')?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(value => {
        this.clientId.set(value);
      });
  }

  ngOnInit() {

  }

  get accounts(): FormArray<FormGroup> {
    return this.clientForm.get('accounts') as FormArray;
  }

  realoadClient() {
    this.route.params.
      pipe(
        switchMap((params) => {
          console.log('Query params:', params);
          const clientId = Number(params['clientId']);

          if (clientId) {
            return this.clientDetailService.getClientDetails(clientId).pipe(
              catchError((error) => {
                console.error('Error fetching client details:', error);
                return of(null); // თუ შეცდომა მოხდა, ცარიელი Observable დაბრუნდება
              })
            );
          } else {
            return of(null);
          }
        }),
        takeUntil(this.destroy$)
      ).
      subscribe({
        next: (clientDetails) => {
          if (clientDetails) {
            console.log('Client details:', clientDetails);
            this.clientForm.patchValue(clientDetails);

            console.log('Client ID:  ck', clientDetails.clientId);

            // disable client ID field
            this.clientForm.get('clientId')?.disable();
            this.selectedPhoto = clientDetails.photo;
            this.clientId.set(clientDetails.id);
            this.addAccountButtonDisabled.set(false);

            console.log('Accounts:', clientDetails.accounts);

            // **თუ ანგარიშები არსებობს, დაამატე**
            this.setAccounts(clientDetails.accounts || []);
          }
        },
        error: (error) => {
          console.error('Error fetching client details:', error);
        }
      });
  }

  setAccounts(accounts: any[]) {
    const accountsFormArray = this.clientForm.get('accounts') as FormArray;
    accountsFormArray.clear();

    accounts.forEach((account, index) => {
      const accountGroup = this.createAccountGroup(account);
      accountsFormArray.push(accountGroup);


      // ვინახავთ ექაუნთის საწყის ვერსიას
      this.originalAccounts[index] = { ...account };

      // საწყისად ღილაკები გამორთულია
      this.allowEditMap[index] = false;
      this.allowOnCancelMap[index] = false;

      // ვაკვირდებით ექაუნთის ცვლილებებს
      accountGroup.valueChanges.pipe(takeUntil(this.destroy$)).subscribe(() => {
        const isChanged = accountGroup.dirty && accountGroup.valid;
        this.allowEditMap[index] = isChanged;
        this.allowOnCancelMap[index] = isChanged;
      });
    });
  }




  cancelEdit(account: any, index: number) {

    // თუ ახალი ანგარიშია, პირდაპირ ვშლით
    if (!this.originalAccounts[index]) {
      const accountsArray = this.clientForm.get('accounts') as FormArray;
      accountsArray.removeAt(index);
    } else {
      // წინააღმდეგ შემთხვევაში, ვაბრუნებთ საწყის მონაცემებს
      account.reset(this.originalAccounts[index]);
      this.allowEditMap[index] = false;
      this.allowOnCancelMap[index] = false;
    }
  }



  updateAccount(account: FormGroup, index: number) {
    if (account.valid) {
      console.log('Account updated:', account.value);

      this.accountService.updateAccount(account.value).pipe(
        takeUntilDestroyed(this.destroyRef)
      ).subscribe({
        next: (updatedAccount) => {
          console.log('Account updated successfully:', updatedAccount);
          // განახლების შემდეგ ღილაკი უნდა გაქრეს
          this.allowEditMap[index] = false;
          this.allowOnCancelMap[index] = false;

          // განახლებული ინფორმაცის გამოტანა
          this.dialog.open(SuccessDialogComponent, {
            data: { message: 'ანგარიში წარმატებით განახლდა!' }
          });
          this.realoadClient();
        },
        error: (error) => {
          console.error('Error updating account:', error);
          this.dialog.open(ErrorDialogComponent, {
            data: { message: `${error.error}  ${error.message}` }
          });
        }
      });
    }
  }

  // **ანგარიშისთვის `FormGroup`-ის შექმნა**
  createAccountGroup(account: any): FormGroup {
    return this.formBuilder.group({
      clientId: [this.clientId(), Validators.required], // დაამატე clientId
      type: [account.type, Validators.required],
      currency: [account.currency, Validators.required],
      status: [account.status, Validators.required],
      accountNumber: [account.accountNumber, [Validators.required, Validators.pattern(/^\d+$/)]],
      id: [account.id]
    });
  }

  addAccount() {
    const accountsFormArray = this.clientForm.get('accounts') as FormArray;
    const newAccount = this.createAccountGroup({});
    accountsFormArray.push(newAccount);

    const newIndex = accountsFormArray.length - 1;

    // ახალ ანგარიშზე თავიდანვე ვუშვებთ "შენახვის" და "გაუქმების" ღილაკს
    this.allowSaveMap[newIndex] = true;
    this.allowOnCancelMap[newIndex] = true;
  }

  removeAccount(account: any, index: number) {

    console.log('Account removed:', account);
    const accountsArray = this.clientForm.get('accounts') as FormArray;
    accountsArray.removeAt(index);

    const accountId = account.value.id;

    // delete requset
    this.accountService.deleteAccount(accountId).pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      next: () => {
        console.log('Account deleted successfully');
        this.dialog.open(SuccessDialogComponent, {
          data: { message: 'ანგარიში წაიშალა!' }
        });
      },
      error: (error) => {
        console.error('Error deleting account:', error);
        this.dialog.open(ErrorDialogComponent, {
          data: { message: `${error.error}  ${error.message}` }
        });
      }
    });
  }




  // **ახალი ანგარიშის შენახვა**
  saveAccount(accountData: any, index: number) {
    console.log('Account data:', accountData);
    this.accountService.postAccount(accountData.value).pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      next: (createdAccount) => {
        console.log('Account created successfully:', createdAccount);
        this.addAccountButtonDisabled.set(false);
        this.allowSaveMap[index] = false;
        this.allowOnCancelMap[index] = false;

        this.dialog.open(SuccessDialogComponent, {
          data: { message: 'ანგარიში წარმატებით დაემატა!' }
        });
        this.realoadClient();
      },
      error: (error) => {
        console.error('Error creating account:', error);
        this.dialog.open(ErrorDialogComponent, {
          data: { message: `${error.error}  ${error.message}` }
        });
      }
    });
  }



  // ფოტოს ატვირთვა და Base64 გარდაქმნა
  onFileSelected(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];

    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        this.selectedPhoto = reader.result; // Base64 მონაცემები
        this.clientForm.patchValue({ photo: this.selectedPhoto });
      };
      reader.readAsDataURL(file);
    }
  }

  submitForm() {
    if (this.clientForm.valid) {
      console.log('Form is valid', this.clientForm.value);
      let clientObj = { ...this.clientForm.value };
      delete clientObj.accounts;
      console.log('Client data:', this.clientId());
      clientObj.id = Number(this.clientId());

      console.log('Client data:', clientObj);



      this.clientService.updateClient(clientObj).pipe(
        takeUntilDestroyed(this.destroyRef)
      ).subscribe({
        next: (updatedClient) => {
          console.log('Client updated successfully:', updatedClient);
          this.dialog.open(SuccessDialogComponent, {
            data: { message: 'კლიენტი წარმატებით განახლდა!' }
          });
          this.realoadClient();
        },
        error: (error) => {
          console.error('Error updating client:', error);
          this.dialog.open(ErrorDialogComponent, {
            data: { message: `${error.error}  ${error.message}` }
          });
        }
      });

    } else {
      console.log('Form is invalid');
    }
  }


  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
