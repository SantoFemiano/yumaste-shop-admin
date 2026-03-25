import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AdminService } from '../../services/admin';
import { AuthService } from '../../services/auth';
import { Magazzino, Ingrediente, IngredienteMagazzinoResponse, IngredienteMagazzinoRequest } from '../../models/admin-models';
import { finalize, switchMap } from 'rxjs/operators';
import { forkJoin } from 'rxjs';
import { NavbarComponent } from '../navbar/navbar';

@Component({
  selector: 'app-magazzini',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, NavbarComponent],
  templateUrl: './magazzini.html'
})
export class MagazziniComponent implements OnInit {
  magazzini: Magazzino[] = [];
  tutteLeGiacenze: IngredienteMagazzinoResponse[] = [];
  ingredientiDisponibili: Ingrediente[] = [];

  isLoading: boolean = false;
  isSaving: boolean = false;

  nuovoMagazzino: Magazzino = {
    nome: '', via: '', civico: '', cap: '', citta: '', provincia: ''
  };

  // --- Variabile per Modifica Magazzino ---
  magazzinoInModifica: Magazzino | null = null;

  // --- Variabili per Modale Inventario ---
  magazzinoSelezionato: Magazzino | null = null;
  giacenzeSelezionate: IngredienteMagazzinoResponse[] = [];
  isSavingGiacenza: boolean = false;

  nuovaGiacenza: IngredienteMagazzinoRequest = {
    magazzinoId: 0,
    ingredienteId: 0,
    quantita: 0,
    lotto: '',
    dataIngresso: new Date().toISOString().split('T')[0] // Data di oggi di default
  };

  constructor(
    private adminService: AdminService,
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.caricaDati();
  }

  caricaDati() {
    this.isLoading = true;

    forkJoin({
      magazzini: this.adminService.getMagazzini(),
      giacenze: this.adminService.getIngredienteMagazzino(),
      ingredienti: this.adminService.getIngredienti()
    }).pipe(
      finalize(() => {
        this.isLoading = false;
        this.cdr.detectChanges();
      })
    ).subscribe({
      next: (res: any) => {
        this.magazzini = res.magazzini;
        this.tutteLeGiacenze = res.giacenze;
        this.ingredientiDisponibili = res.ingredienti.filter((i: any) => i.id != null);
      },
      error: (err) => console.error('Errore nel caricamento dati:', err)
    });
  }

  salvaMagazzino(form: any) {
    this.isSaving = true;
    this.adminService.addMagazzino(this.nuovoMagazzino).pipe(
      finalize(() => {
        this.isSaving = false;
        this.cdr.detectChanges();
      })
    ).subscribe({
      next: (res) => {
        alert('Magazzino aggiunto con successo!');
        this.caricaDati();
        form.resetForm();
      },
      error: (err) => {
        console.error(err);
        alert('Errore durante il salvataggio del magazzino.');
      }
    });
  }

  // --- MODIFICA E CANCELLAZIONE MAGAZZINO ---

  apriModaleModifica(m: Magazzino) {
    this.magazzinoInModifica = { ...m };
  }

  salvaModificaMagazzino() {
    if (this.magazzinoInModifica && this.magazzinoInModifica.id) {
      this.isSaving = true;
      this.adminService.updateMagazzino(this.magazzinoInModifica.id, this.magazzinoInModifica).pipe(
        finalize(() => {
          this.isSaving = false;
          this.cdr.detectChanges();
        })
      ).subscribe({
        next: () => {
          alert('Magazzino aggiornato con successo!');
          this.magazzinoInModifica = null; // Chiude il modale
          this.caricaDati();
        },
        error: (err) => {
          console.error('Errore aggiornamento magazzino:', err);
          alert('Impossibile aggiornare il magazzino.');
        }
      });
    }
  }

  onDeleteMagazzino(id: number | undefined) {
    if (!id) return;
    if (confirm('Sei sicuro di voler eliminare questo magazzino?')) {
      this.adminService.deleteMagazzino(id).subscribe({
        next: () => {
          alert('Magazzino eliminato con successo!');
          this.caricaDati();
        },
        error: (err) => {
          console.error('Errore durante l\'eliminazione', err);
          alert('Impossibile eliminare il magazzino. Potrebbero esserci giacenze collegate.');
        }
      });
    }
  }

  // --- GESTIONE INVENTARIO (Invariato) ---

  apriInventario(magazzino: Magazzino) {
    this.magazzinoSelezionato = magazzino;
    this.aggiornaGiacenzeSelezionate();

    this.nuovaGiacenza = {
      magazzinoId: magazzino.id!,
      ingredienteId: 0,
      quantita: 0,
      lotto: '',
      dataIngresso: new Date().toISOString().split('T')[0]
    };
  }

  aggiornaGiacenzeSelezionate() {
    if (this.magazzinoSelezionato?.id) {
      this.giacenzeSelezionate = this.tutteLeGiacenze.filter(g => g.magazzinoId === this.magazzinoSelezionato!.id);
    } else {
      this.giacenzeSelezionate = [];
    }
  }

  salvaGiacenza(form: any) {
    if (!this.magazzinoSelezionato?.id || this.nuovaGiacenza.ingredienteId === 0) {
      alert("Errore: Assicurati di aver selezionato un ingrediente.");
      return;
    }

    this.isSavingGiacenza = true;
    this.nuovaGiacenza.magazzinoId = this.magazzinoSelezionato.id;

    this.adminService.addIngredienteMagazzino(this.nuovaGiacenza).pipe(
      switchMap(() => this.adminService.getIngredienteMagazzino()),
      finalize(() => {
        this.isSavingGiacenza = false;
        this.cdr.detectChanges();
      })
    ).subscribe({
      next: (giacenzeAggiornate) => {
        this.tutteLeGiacenze = giacenzeAggiornate;
        this.aggiornaGiacenzeSelezionate();

        this.nuovaGiacenza = {
          magazzinoId: this.magazzinoSelezionato!.id!,
          ingredienteId: 0,
          quantita: 0,
          lotto: '',
          dataIngresso: new Date().toISOString().split('T')[0]
        };

        form.resetForm(this.nuovaGiacenza);
      },
      error: (err) => {
        console.error("Errore API salvataggio:", err);
        alert("Errore durante il caricamento della merce. Controlla la console per i dettagli.");
      }
    });
  }
}
