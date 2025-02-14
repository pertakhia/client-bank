import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { LoginData, LoginService } from '../../../services/auth/login.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';



@Component({
  selector: 'app-login',
  imports: [
    MatInputModule,
    MatButtonModule,
    ReactiveFormsModule,
    FormsModule,
    CommonModule
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent implements OnInit {
  private formBuilder = inject(FormBuilder);
  public loginService = inject(LoginService);
  public router = inject(Router);
  destroyRef = inject(DestroyRef);
  loginForm!: FormGroup;

  constructor() {
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  ngOnInit() {

  }

  onSubmit() {
    if (this.loginForm.valid) {
      let loginData: LoginData = {
        email: this.loginForm.value.email,
        password: this.loginForm.value.password
      };

      this.loginService.login(loginData)
        .pipe(
          takeUntilDestroyed(this.destroyRef)
        )
        .subscribe(
          response => {
            if (response.success) {
              // Redirect to clients page
              this.router.navigate(['/clients']);
            } else {
              // Show error message
              this.loginForm.controls['email'].setErrors({ 'incorrect': true });
              this.loginForm.controls['password'].setErrors({ 'incorrect': true });
            }
          }
        );

    }
  }

}
