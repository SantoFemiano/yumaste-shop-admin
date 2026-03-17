import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AdminService } from '../../services/admin';
import { AuthService } from '../../services/auth';
import { Fornitore } from '../../models/admin-models';
import { finalize } from 'rxjs/operators';
import { NavbarComponent} from '../navbar/navbar';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, NavbarComponent],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class DashboardComponent implements OnInit {
  fornitori: Fornitore[] = [];
  isLoading: boolean = false;
  isSaving: boolean = false;


  nuovoFornitore: Fornitore = {
    partitaIva: '', nome: '', via: '', civico: '', cap: '', citta: '', provincia: ''
  };

  constructor(
    private adminService: AdminService,
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef // <-- 2. Iniettalo nel costruttore
  ) {}

  ngOnInit(): void {
    this.caricaFornitori();
  }

  caricaFornitori() {
    this.isLoading = true;

    this.adminService.getFornitori().pipe(
      finalize(() => {
        console.log('🔹 3. Pipeline completata. Spengo lo spinner e forzo la UI.');
        this.isLoading = false;

        // 3. QUESTO È IL COMANDO MAGICO CHE SBLOCCA LA GRAFICA
        this.cdr.detectChanges();
      })
    ).subscribe({
      next: (dati) => {
        console.log('🔹 2. Dati ricevuti:', dati);
        this.fornitori = dati;
      },
      error: (err) => {
        console.error('🔹 2. Errore di rete/server:', err);
      }
    });
  }

  salvaFornitore(form: any) {
    this.isSaving = true;
    this.adminService.addFornitore(this.nuovoFornitore).pipe(
      finalize(() => this.isSaving = false)
    ).subscribe({
      next: (res) => {
        alert('Fornitore aggiunto con successo!');
        this.caricaFornitori(); // Ricarichiamo la tabella aggiornata
        form.reset(); // Svuotiamo il form
      },
      error: (err) => {
        console.error('Errore durante il salvataggio:', err);
        alert('Errore! Controlla i dati o la Partita IVA (potrebbe esistere già).');
      }
    });
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
