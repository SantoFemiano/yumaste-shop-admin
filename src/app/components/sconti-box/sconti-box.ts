import {ChangeDetectorRef, Component, OnInit} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../services/admin';
import { Box, Sconto } from '../../models/admin-models';
import { NavbarComponent } from '../navbar/navbar';
import { finalize } from 'rxjs/operators';
import { forkJoin } from 'rxjs'; // Importante per chiamate multiple!

@Component({
  selector: 'app-sconti-box',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarComponent],
  templateUrl: './sconti-box.html'
})
export class ScontiBoxComponent implements OnInit {
  boxes: Box[] = [];
  sconti: Sconto[] = [];
  isLoading: boolean = false;
  isSaving: boolean = false;

  // Variabili per memorizzare le scelte dell'utente nei menu a tendina
  selectedBoxId: number | null = null;
  selectedScontoId: number | null = null;

  constructor(private adminService: AdminService,
  private cdr: ChangeDetectorRef
) {}

  ngOnInit(): void {
    this.caricaDati();
  }

  caricaDati() {
    this.isLoading = true;

    // forkJoin fa partire le due chiamate API in parallelo
    forkJoin({
      boxesRes: this.adminService.getBoxes(),
      scontiRes: this.adminService.getScontiValidi()
    }).pipe(
      finalize(() => {this.isLoading = false;
        this.cdr.detectChanges();}
      )
    ).subscribe({
      next: (risultati: any) => {
        // Gestiamo il fatto che le Box sono dentro una "Page" (content)
        this.boxes = risultati.boxesRes.content ? risultati.boxesRes.content : risultati.boxesRes;

        // Filtriamo gli sconti per mostrare nella tendina SOLO quelli ancora attivi
        this.sconti = risultati.scontiRes.filter((s: Sconto) => s.attivo === true);
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

    // CREIAMO IL PAYLOAD ESATTAMENTE COME LO VUOLE SWAGGER
    const payload = {
      scontoId: this.selectedScontoId,
      boxIds: [this.selectedBoxId] // Lo mettiamo in un array!
    };

    // Usiamo il payload
    this.adminService.applicaScontoABox(payload).pipe(
      finalize(() => {this.isSaving = false;
        this.cdr.detectChanges();})
    ).subscribe({
      next: (response) => {
        alert('Sconto applicato con successo!');
        this.selectedBoxId = null;
        this.selectedScontoId = null;
        // Ricarica la tabella
        this.caricaDati();
      },
      error: (err) => {
        console.error('Errore durante il collegamento:', err);
        alert('Errore durante il collegamento. Verifica i dati.');
      }
    });
  }
}
