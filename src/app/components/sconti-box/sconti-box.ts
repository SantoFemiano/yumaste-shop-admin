import {ChangeDetectorRef, Component, OnInit} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../services/admin';
import { Box, Sconto } from '../../models/admin-models';
import { NavbarComponent } from '../navbar/navbar';
import { finalize } from 'rxjs/operators';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-sconti-box',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarComponent],
  templateUrl: './sconti-box.html'
})
export class ScontiBoxComponent implements OnInit {
  boxes: Box[] = [];
  sconti: Sconto[] = [];
  associazioni: any[] = []; // Salva le coppie {scontoId, boxId}

  isLoading: boolean = false;
  isSaving: boolean = false;

  selectedBoxId: number | null = null;
  selectedScontoId: number | null = null;

  constructor(private adminService: AdminService, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.caricaDati();
  }

  caricaDati() {
    this.isLoading = true;

    forkJoin({
      boxesRes: this.adminService.getBoxes(),
      scontiRes: this.adminService.getScontiValidi(),
      associazioniRes: this.adminService.getAssociazioniScontoBox() // Scarichiamo le associazioni!
    }).pipe(
      finalize(() => {
        this.isLoading = false;
        this.cdr.detectChanges();
      })
    ).subscribe({
      next: (risultati: any) => {
        this.boxes = risultati.boxesRes.content ? risultati.boxesRes.content : risultati.boxesRes;
        this.sconti = risultati.scontiRes.filter((s: Sconto) => s.attivo === true);
        this.associazioni = risultati.associazioniRes;
      },
      error: (err) => { console.error('Errore caricamento dati:', err); }
    });
  }

  collegaSconto() {
    if (!this.selectedBoxId || !this.selectedScontoId) {
      alert("Seleziona sia una Box che uno Sconto!");
      return;
    }

    this.isSaving = true;

    const payload = {
      scontoId: this.selectedScontoId,
      boxIds: [this.selectedBoxId]
    };

    this.adminService.applicaScontoABox(payload).pipe(
      finalize(() => {
        this.isSaving = false;
        this.cdr.detectChanges();
      })
    ).subscribe({
      next: () => {
        alert('Sconto applicato con successo!');
        this.selectedBoxId = null;
        this.selectedScontoId = null;
        this.caricaDati(); // Ricarica tutto
      },
      error: (err) => {
        console.error('Errore durante il collegamento:', err);
        alert('Errore durante il collegamento. Verifica i dati.');
      }
    });
  }

  // --- NUOVO METODO RIMOZIONE ---
  rimuoviScontoDallaBox(boxId: number | undefined) {
    if (!boxId) return;

    // Peschiamo l'associazione dalla lista scaricata per ricavarne lo Sconto ID
    const associazione = this.associazioni.find(a => a.boxId === boxId);

    if (!associazione || !associazione.scontoId) {
      alert("Errore: Impossibile trovare lo sconto associato a questa Box.");
      return;
    }

    if (confirm("Vuoi rimuovere l'offerta speciale da questa Food Box?")) {
      this.adminService.removeScontoFromBox(associazione.scontoId, boxId).subscribe({
        next: () => {
          alert('Sconto rimosso con successo!');
          this.caricaDati(); // Aggiorna la UI per mostrare la box senza sconto
        },
        error: (err) => {
          console.error(err);
          alert('Si è verificato un errore durante la rimozione dello sconto.');
        }
      });
    }
  }
}
