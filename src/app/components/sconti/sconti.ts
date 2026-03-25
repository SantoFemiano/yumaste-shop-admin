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

  // Variabile per lo sconto in fase di modifica
  scontoInModifica: Sconto | null = null;

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

  // --- LOGICA MODIFICA SCONTO ---
  apriModaleModifica(sconto: Sconto) {
    // Creiamo una copia per non sporcare la tabella prima del salvataggio
    this.scontoInModifica = { ...sconto };
  }

  salvaModificaSconto() {
    if (this.scontoInModifica && this.scontoInModifica.id) {
      this.isSaving = true;
      this.adminService.updateSconto(this.scontoInModifica.id, this.scontoInModifica).pipe(
        finalize(() => {
          this.isSaving = false;
          this.cdr.detectChanges();
        })
      ).subscribe({
        next: () => {
          alert('Sconto aggiornato con successo!');
          this.scontoInModifica = null; // Chiude il modale
          this.caricaSconti(); // Aggiorna i dati
        },
        error: (err) => {
          console.error('Errore durante l\'aggiornamento:', err);
          alert('Impossibile aggiornare lo sconto.');
        }
      });
    }
  }

  onDeleteSconto(id: number | undefined) {
    if (!id) return;
    if (confirm('Sei sicuro di voler eliminare definitivamente questo sconto?')) {
      this.adminService.deleteSconto(id).subscribe({
        next: () => {
          alert('Sconto eliminato con successo!');
          this.caricaSconti();
        },
        error: (err) => {
          console.error('Errore durante l\'eliminazione:', err);
          alert('Impossibile eliminare lo sconto. Potrebbe essere attualmente associato a una Box.');
        }
      });
    }
  }
}
