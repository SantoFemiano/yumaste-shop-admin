import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../services/admin';
import { Box } from '../../models/admin-models';
import { NavbarComponent } from '../navbar/navbar';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-box',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarComponent],
  templateUrl: './box.html'
})
export class BoxComponent implements OnInit {
  boxes: Box[] = [];
  isLoading: boolean = false;
  isSaving: boolean = false;

  // Nuove variabili per i dettagli della Box
  boxSelezionataDettagli: any = null;
  isLoadingDettagli: boolean = false;

  nuovaBox: Box = {
    ean: '',
    nome: '',
    categoria: '',
    prezzo: 0,
    prezzoScontato: 0,
    percentualeSconto: 0,
    porzioni: 1,
    quantitaInBox: 1,
    immagineUrl: '',
    attivo: true
  };

  constructor(
    private adminService: AdminService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.caricaBoxes();
  }

  caricaBoxes() {
    this.isLoading = true;
    this.adminService.getBoxes().pipe(
      finalize(() => {
        this.isLoading = false;
        this.cdr.detectChanges();
      })
    ).subscribe({
      next: (response: any) => {
        this.boxes = response.content ? response.content : response;
      },
      error: (err) => { console.error('Errore nel caricamento box:', err); }
    });
  }

  // NUOVO METODO: Scarica i dettagli della box selezionata
  apriDettagli(box: Box) {
    this.boxSelezionataDettagli = null; // Reset dati precedenti
    if (box.id) {
      this.isLoadingDettagli = true;
      this.adminService.getBoxDettagli(box.id).pipe(
        finalize(() => {
          this.isLoadingDettagli = false;
          this.cdr.detectChanges();
        })
      ).subscribe({
        next: (res: any) => {
          this.boxSelezionataDettagli = res;
        },
        error: (err) => {
          console.error("Errore recupero dettagli box", err);
          alert("Impossibile caricare i dettagli di questa Box.");
        }
      });
    }
  }

  salvaBox(form: any) {
    this.isSaving = true;
    this.adminService.addBox(this.nuovaBox).pipe(
      finalize(() => {
        this.isSaving = false;
        this.cdr.detectChanges();
      })
    ).subscribe({
      next: () => {
        alert('Box creata con successo!');
        this.caricaBoxes();

        // Svuota il form mantenendo i valori di base corretti
        form.resetForm({
          prezzo: 0, porzioni: 1, quantitaInBox: 1, attivo: true,
        });
      },
      error: (err) => {
        console.error('Errore durante il salvataggio:', err);
        alert('Errore durante la creazione della Box.');
      }
    });
  }
}
