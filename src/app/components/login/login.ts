import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // Serve per leggere i dati dal form HTML
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth';
import { LoginRequest } from '../../models/auth';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule], // Importiamo i moduli necessari
  templateUrl: './login.html',
  styleUrl: './login.css'
})

export class LoginComponent {
  // Variabile per memorizzare email e password digitati dall'utente
  credentials: LoginRequest = { email: '', password: '' };

  // Variabile per mostrare un eventuale messaggio di errore
  errorMessage: string = '';

  // "Iniettiamo" i servizi che ci servono nel costruttore
  constructor(private authService: AuthService, private router: Router) {}

  // Questo metodo viene chiamato quando l'utente clicca su "Accedi"
  onSubmit() {
    this.authService.login(this.credentials).subscribe({
      next: (response) => {
        console.log('Login completato! Token salvato.');
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        // Se il backend restituisce un errore (es. password errata), mostriamo questo messaggio
        this.errorMessage = 'Email o password non validi. Controlla e riprova.';
        console.error(err);
      }
    });
  }
}
