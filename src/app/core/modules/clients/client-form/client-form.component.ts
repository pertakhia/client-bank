import { ChangeDetectorRef, Component, DestroyRef, effect, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCardModule } from '@angular/material/card';
import { ReactiveFormsModule } from '@angular/forms';
import { NgFor, NgIf } from '@angular/common';
import { MatDividerModule } from '@angular/material/divider';
import { MatIcon } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { AccountFormComponent } from '../../accounts/account-form/account-form.component';
import { catchError, interval, Subject, switchMap, takeUntil, tap, throwError } from 'rxjs';
import { ClientListService } from '../../../services/clients/client-list.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AccountsService } from '../../../services/accounts/accounts.service';
import { MatDialogModule } from '@angular/material/dialog';
import { MatDialog } from '@angular/material/dialog';
import { SuccessDialogComponent } from '../../../../shared/component/success-dialog/success-dialog.component';
import { ErrorDialogComponent } from '../../../../shared/component/error-dialog/error-dialog.component';
import { animate, keyframes, state, style, transition, trigger } from '@angular/animations';


@Component({
  selector: 'app-client-form',
  imports: [MatButtonModule, MatInputModule,
    MatSelectModule, MatCardModule, ReactiveFormsModule,
    NgIf, NgFor, MatDividerModule, MatIcon, CommonModule,
    AccountFormComponent,
    MatDialogModule],
  templateUrl: './client-form.component.html',
  styleUrl: './client-form.component.scss',
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
        animate('0.8s', 
        // keyframes for animation
        keyframes([
          // rotate 0 at 0%
          style({ opacity: 0, transform: 'translateY(48px)', offset: 0}),
          // rotate 0 at 50%
          style({ opacity: 1, transform: 'translateY(0)', offset: 1}),
        ]))),

    ]),
  ]
})
export class ClientFormComponent implements OnInit, OnDestroy {
  private formBuilder = inject(FormBuilder);
  private dialog = inject(MatDialog);
  public clientService = inject(ClientListService);
  public accountService = inject(AccountsService);
  private destroy$ = new Subject<void>();
  private cdr = inject(ChangeDetectorRef)
  destroyRef = inject(DestroyRef);
  animationState = 'void';


  clientForm!: FormGroup;
  genders = signal(['კაცი', 'ქალი']);
  selectedPhoto: string | ArrayBuffer | null = null; // Base64 ფოტოს შენახვა
  clientId = signal(''); // კლიენტის ID
  addAccountButtonDisabled = signal(false);



  constructor() {
    effect(() => {
      if (this.clientId()) {
        this.accounts.controls.forEach(account => {
          account.patchValue({ clientId: this.clientId() });
        });
      }

    });
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



  addAccount() {
    const accountForm = this.formBuilder.group({
      clientId: [this.clientId(), Validators.required], // დაამატე clientId
      type: ['', Validators.required],
      currency: ['', Validators.required],
      status: ['', Validators.required],
      accountNumber: ['', [Validators.required, Validators.pattern(/^\d+$/)]] // მხოლოდ ციფრები
    });


    this.accounts.push(accountForm);
    this.addAccountButtonDisabled.set(true);
  }

  removeAccount(index: number) {
    this.accounts.removeAt(index);
    this.addAccountButtonDisabled.set(false);
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
      let clientObj = { ...this.clientForm.value };
      delete clientObj.accounts;
      clientObj.id = Number(this.clientId());

      let accountObj = this.accounts.controls[0]?.value;

      this.clientService.postClient(clientObj).pipe(
        switchMap((createdClient) => {
          return this.accountService.postAccount(accountObj).pipe(
            catchError((accountError) => {
              // თუ ანგარიშის შექმნა ჩავარდა, ვშლით უკვე დამატებულ კლიენტს
              return this.clientService.deleteClient(createdClient.id).pipe(
                tap(() => console.log('Client deleted due to account creation failure')),
                switchMap(() => throwError(() => accountError)) // ხელახლა აგდებს შეცდომას
              );
            })
          );
        }),
        takeUntilDestroyed(this.destroyRef)
      ).subscribe({
        next: () => {
          // წარმატებული ოპერაციების შემდეგ ვასუფთავებთ ფორმას

          const dialogRef = this.dialog.open(SuccessDialogComponent, {
            data: { message: 'კლიენტი და ანგარიში წარმატებით დაემატა!' }
          });

          dialogRef.afterClosed()
            .pipe(takeUntil(this.destroy$))
            .subscribe(() => {
              setTimeout(() => {
                this.clientForm.reset();

                // აქ ვამოწმებთ, რომ `accounts` ველი კვლავ ინიციალიზებული იყოს
                if (!this.clientForm.get('accounts')) {
                  this.clientForm.setControl('accounts', new FormArray([]));
                } else {
                  (this.clientForm.get('accounts') as FormArray).clear(); // თუ არსებობს, ვასუფთავებთ
                }

                this.clientForm.markAsPristine();
                this.clientForm.markAsUntouched();
                this.clientForm.updateValueAndValidity({ onlySelf: true });

                this.selectedPhoto = null;
                this.addAccountButtonDisabled.set(false);
              }, 0);
            });
        },
        error: (error) => {
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
