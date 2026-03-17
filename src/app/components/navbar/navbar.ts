import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router'; // Serve per i link
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-navbar', // Questo è il "Tag" HTML che useremo
  standalone: true,
  imports: [RouterModule], // Importiamo il modulo per far funzionare routerLink
  templateUrl: './navbar.html'
})
export class NavbarComponent {

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
