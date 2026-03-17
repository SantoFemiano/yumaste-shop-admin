import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../services/admin';
import { Sconto } from '../../models/admin-models';
import { NavbarComponent } from '../navbar/navbar';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-sconti',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarComponent],
  templateUrl: './sconti.html'
})
export class ScontiComponent implements OnInit {
  sconti: Sconto[] = [];
  isLoading: boolean = false;
  isSaving: boolean = false;

  nuovoSconto: Sconto = {
    nome: '',
    valore: 0,
    attivo: true,
    inizioSconto: '',
    fineSconto: ''
  };

  constructor(
    private adminService: AdminService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.caricaSconti();
  }

  caricaSconti() {
    this.isLoading = true;
    this.adminService.getSconti().pipe(
      finalize(() => {
        this.isLoading = false;
        this.cdr.detectChanges();
      })
    ).subscribe({
      next: (dati) => {
        this.sconti = dati;
      },
      error: (err) => {
        console.error('Errore durante il caricamento degli sconti:', err);
      }
    });
  }

  salvaSconto(form: any) {
    this.isSaving = true;
    this.adminService.addSconto(this.nuovoSconto).pipe(
      finalize(() => {
        this.isSaving = false;
        this.cdr.detectChanges();
      })
    ).subscribe({
      next: () => {
        alert('Sconto creato con successo!');
        this.caricaSconti();
        form.resetForm({ attivo: true, valore: 0 });
      },
      error: (err) => {
        console.error('Errore durante il salvataggio:', err);
        alert('Errore durante la creazione dello sconto.');
      }
    });
  }
}
