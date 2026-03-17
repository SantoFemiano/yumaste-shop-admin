import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AdminService } from '../../services/admin';
import { AuthService } from '../../services/auth';
import { Magazzino } from '../../models/admin-models';
import { finalize } from 'rxjs/operators';
import {NavbarComponent} from '../navbar/navbar';

@Component({
  selector: 'app-magazzini',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, NavbarComponent],
  templateUrl: './magazzini.html'
})
export class MagazziniComponent implements OnInit {
  magazzini: Magazzino[] = [];
  isLoading: boolean = false;
  isSaving: boolean = false;

  nuovoMagazzino: Magazzino = {
    nome: '', via: '', civico: '', cap: '', citta: '', provincia: ''
  };

  constructor(
    private adminService: AdminService,
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef // Iniezione per sbloccare la UI
  ) {}

  ngOnInit(): void {
    this.caricaMagazzini();
  }

  caricaMagazzini() {
    this.isLoading = true;
    this.adminService.getMagazzini().pipe(
      finalize(() => {
        this.isLoading = false;
        this.cdr.detectChanges(); // Forza l'aggiornamento visivo a fine chiamata
      })
    ).subscribe({
      next: (dati) => {
        this.magazzini = dati;
      },
      error: (err) => {
        console.error('Errore durante il caricamento dei magazzini:', err);
      }
    });
  }

  salvaMagazzino(form: any) {
    this.isSaving = true;
    this.adminService.addMagazzino(this.nuovoMagazzino).pipe(
      finalize(() => {
        this.isSaving = false;
        this.cdr.detectChanges(); // Forza l'aggiornamento visivo a fine salvataggio
      })
    ).subscribe({
      next: (res) => {
        alert('Magazzino aggiunto con successo!');

        // Chiudiamo programmaticamente il modale Bootstrap se è aperto (Opzionale ma utile)
        const modalElement = document.getElementById('modalMagazzino');
        if (modalElement) {
          // Se usi la libreria nativa di Bootstrap (bootstrap.Modal.getInstance) puoi chiuderlo qui
        }

        this.caricaMagazzini(); // Ricarica la lista
        form.reset(); // Svuota il form
      },
      error: (err) => {
        console.error('Errore durante il salvataggio:', err);
        alert('Errore durante il salvataggio del magazzino.');
      }
    });
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
