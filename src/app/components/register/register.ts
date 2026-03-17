import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {Router, RouterModule} from '@angular/router';
import { AuthService } from '../../services/auth';
import { RegisterRequest } from '../../models/auth';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule,RouterModule],
  templateUrl: './register.html'
})
export class RegisterComponent {
  userData: RegisterRequest = {
    cf: '', nome: '', cognome: '', dataNascita: '',
    telefono: '', email: '', password: ''
  };


  errorMessage: string = '';

  constructor(private authService: AuthService, private router: Router) {}

  onRegister() {
    this.authService.register(this.userData).subscribe({
      next: () => {
        alert('Registrazione completata!');
        this.router.navigate(['/login']);
      },
      error: (err) => {
        this.errorMessage = 'Errore durante la registrazione. L\'email potrebbe essere già presente.';
      }
    });
  }



}
