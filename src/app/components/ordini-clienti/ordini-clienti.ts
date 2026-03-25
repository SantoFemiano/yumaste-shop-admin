import {ChangeDetectorRef, Component, OnInit} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {AdminService} from '../../services/admin';
import {NavbarComponent} from '../navbar/navbar';

@Component({
  selector: 'app-ordini-clienti',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarComponent],
  templateUrl: './ordini-clienti.html',
  styleUrls: ['./ordini-clienti.css']
})
export class OrdiniClientiComponent implements OnInit {

  // Dati per la tabella principale
  tuttiGliOrdini: any[] = [];
  clienti: any[] = [];
  ordiniVisualizzati: any[] = [];
  clienteSelezionato: string = '';
  isLoading: boolean = true;

  // Variabili per il Modale Dettagli
  isModalOpen: boolean = false;
  isLoadingDettagli: boolean = false;
  ordineSelezionato: any = null;
  dettagliOrdine: any[] = [];

  constructor(private adminService: AdminService,
              private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.caricaDati();
  }

  caricaDati() {
    this.isLoading = true;

    this.adminService.getClienti().subscribe(res => {
      this.clienti = res;
      this.cdr.detectChanges();
    });

    this.adminService.getTuttiGliOrdini().subscribe({
      next: (res) => {
        this.tuttiGliOrdini = res;
        this.ordiniVisualizzati = res;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Errore nel caricamento degli ordini', err);
        this.isLoading = false;
      }
    });
  }

  onChangeStatoOrdine(ordineId: number, nuovoStatoOrdine: string, nuovoStatoSpedizione: string) {
    // Salvataggio silente: non ricarichiamo tutta la tabella per evitare flash visivi.
    // L'[(ngModel)] ha già aggiornato la UI per noi!
    this.adminService.updateStatoOrdine(ordineId, nuovoStatoOrdine, nuovoStatoSpedizione).subscribe({
      next: () => {
        console.log(`Ordine ${ordineId} aggiornato con successo.`);
      },
      error: (err) => {
        console.error('Errore aggiornamento stato', err);
        alert('Errore di connessione: impossibile aggiornare lo stato.');
        this.caricaDati(); // In caso di errore ricarica i dati per ripristinare lo stato reale
      }
    });
  }

  applicaFiltro() {
    if (!this.clienteSelezionato) {
      this.ordiniVisualizzati = this.tuttiGliOrdini;
      this.cdr.detectChanges();
    } else {
      const idSelezionato = parseInt(this.clienteSelezionato, 10);
      this.ordiniVisualizzati = this.tuttiGliOrdini.filter(ordine => ordine.utenteId === idSelezionato);
      this.cdr.detectChanges();
    }
  }

  // --- LOGICA MODALE DETTAGLI ---
  apriDettagli(ordine: any) {
    this.ordineSelezionato = ordine;
    this.isModalOpen = true;
    this.isLoadingDettagli = true;

    this.adminService.getDettagliOrdine(ordine.id).subscribe({
      next: (res) => {
        this.dettagliOrdine = res;
        this.isLoadingDettagli = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Errore nel caricamento dei dettagli', err);
        this.isLoadingDettagli = false;
      }
    });
  }

  chiudiModale() {
    this.isModalOpen = false;
    this.ordineSelezionato = null;
    this.dettagliOrdine = [];
  }

  // Metodo per colorare le select in base allo stato
  getSelectClass(stato: string): string {
    switch (stato) {
      case 'IN_ATTESA': return 'bg-warning text-dark border-warning';
      case 'IN_PREPARAZIONE':
      case 'IN_LAVORAZIONE': return 'bg-info text-dark border-info';
      case 'SPEDITO':
      case 'AFFIDATO_AL_CORRIERE':
      case 'IN_TRANSITO': return 'bg-primary text-white border-primary';
      case 'COMPLETATO':
      case 'CONSEGNATO': return 'bg-success text-white border-success';
      case 'ANNULLATO': return 'bg-danger text-white border-danger';
      default: return 'bg-light text-dark border-secondary';
    }
  }
}
