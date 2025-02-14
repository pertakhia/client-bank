import { NgIf, NgFor, CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatIcon } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { Account } from '../../../interfaces/account';

@Component({
  selector: 'app-account-form',
  imports: [MatButtonModule, MatInputModule, MatSelectModule, MatCardModule, ReactiveFormsModule, NgIf, NgFor, MatDividerModule, MatIcon, CommonModule],
  templateUrl: './account-form.component.html',
  styleUrl: './account-form.component.scss'
})
export class AccountFormComponent implements OnInit {


  @Input() accountForm!: FormGroup;
  @Input() allowRemove = false; // Remove ღილაკის კონტროლი
  @Input() allowSave: boolean = false; // Save ღილაკის კონტროლი
  @Input() allowEdit: boolean = false; // Edit ღილაკის კონტროლი
  @Input() allowOnCancel: boolean = false; // Cancel ღილაკის კონტროლი
  @Output() saveAccountEvent = new EventEmitter<FormGroup>();
  @Output() removeAccount = new EventEmitter<void>();
  @Output() editAccount = new EventEmitter<void>();
  @Output() onCancel = new EventEmitter<void>();

  accountTypes = ['Current', 'Savings', 'Credit'];
  currencies = ['GEL', 'USD', 'EUR'];
  statuses = ['Active', 'Closed'];



  constructor() {
  }

  ngOnInit() {
  }

  onRemove() {
    // აქ შეგვიძლია გამოვიძახოთ მშობლის ფუნქცია ანგარიშის წასაშლელად
    this.removeAccount.emit();

  }

  updateAccount() {
    if (this.accountForm.valid) {
      this.editAccount.emit(this.accountForm.value);
    } else {
      console.log('Invalid account form');
    }
  }

  onCancle() {
    // აქ შეგვიძლია გამოვიძახოთ მშობლის ფუნქცია ანგარიშის გაუქმებისთვის
    // დავუბრუნდეთ ტავდაპირველ მნიშვნელობას
    this.onCancel.emit();
    console.log('Cancel');
  }

  saveAccount() {
    if (this.accountForm.valid) {
      this.saveAccountEvent.emit(this.accountForm.value);
    } else {
      console.log('Invalid account form');
      // set error message
      this.accountForm.markAllAsTouched();
    }
  }

}
