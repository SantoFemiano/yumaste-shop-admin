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
  boxesInattive: Box[] = []; // Array per il modale archivio
  isLoading: boolean = false;
  isLoadingInattive: boolean = false; // Caricamento per il modale
  isSaving: boolean = false;

  boxSelezionataDettagli: any = null;
  isLoadingDettagli: boolean = false;
  boxInModifica: Box | null = null;

  nuovaBox: Box = {
    ean: '', nome: '', categoria: '', prezzo: 0, prezzoScontato: 0, percentualeSconto: 0, porzioni: 1, quantitaInBox: 1, immagineUrl: '', attivo: true
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

  // --- NUOVO: Carica Archivio Inattive ---
  apriModaleInattive() {
    this.isLoadingInattive = true;
    this.adminService.getBoxesInattive().pipe(
      finalize(() => {
        this.isLoadingInattive = false;
        this.cdr.detectChanges();
      })
    ).subscribe({
      next: (response: any) => {
        this.boxesInattive = response.content ? response.content : response;
      },
      error: (err) => { console.error('Errore nel caricamento box inattive:', err); }
    });
  }

  riattivaBox(box: any) { // Mettiamo any perché arriva un CatalogBoxDTO
    if (confirm(`Vuoi riattivare la box "${box.nome}" e rimetterla a catalogo?`)) {

      // Ricostruiamo l'oggetto Box per accontentare il backend e la chiamata PUT
      const boxDaRiattivare: Box = {
        percentualeSconto: 0, prezzoScontato: 0,
        id: box.id,
        ean: box.ean,
        nome: box.nome,
        categoria: box.categoria,
        prezzo: box.prezzo,
        porzioni: box.porzioni,
        quantitaInBox: box.quantitaInBox ? box.quantitaInBox : 1,
        immagineUrl: box.immagineUrl,
        attivo: true
      };

      this.adminService.updateBox(box.id, boxDaRiattivare).subscribe({
        next: () => {
          alert('Box riattivata con successo!');
          this.apriModaleInattive(); // Ricarica la lista delle inattive nel modale
          this.caricaBoxes();        // Aggiorna la tabella principale in background
        },
        error: (err) => {
          console.error('Errore durante la riattivazione:', err);
          alert('Errore durante la riattivazione della box. Controlla la console.');
        }
      });
    }
  }

  apriDettagli(box: Box) {
    this.boxSelezionataDettagli = null;
    if (box.id) {
      this.isLoadingDettagli = true;
      this.adminService.getBoxDettagli(box.id).pipe(
        finalize(() => {
          this.isLoadingDettagli = false;
          this.cdr.detectChanges();
        })
      ).subscribe({
        next: (res: any) => { this.boxSelezionataDettagli = res; },
        error: (err) => {
          console.error("Errore recupero dettagli box", err);
          alert("Impossibile caricare i dettagli.");
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
        form.resetForm({ prezzo: 0, porzioni: 1, quantitaInBox: 1, attivo: true });
      },
      error: (err) => { console.error('Errore', err); alert('Errore creazione Box.'); }
    });
  }

  apriModaleModifica(box: Box) {
    this.boxInModifica = { ...box };
  }

  salvaModificaBox() {
    if (this.boxInModifica && this.boxInModifica.id) {
      this.isSaving = true;
      this.adminService.updateBox(this.boxInModifica.id, this.boxInModifica).pipe(
        finalize(() => {
          this.isSaving = false;
          this.cdr.detectChanges();
        })
      ).subscribe({
        next: () => {
          alert('Box modificata con successo!');
          this.boxInModifica = null;
          this.caricaBoxes();
        },
        error: (err) => { console.error('Errore', err); alert('Impossibile modificare.'); }
      });
    }
  }

  onDeleteBox(id: number | undefined) {
    if (!id) return;
    if (confirm('Sei sicuro di voler disattivare questa Box? Verrà nascosta dal catalogo.')) {
      this.adminService.deleteBox(id).subscribe({
        next: () => {
          alert('Box disattivata con successo.');
          this.caricaBoxes();
        },
        error: (err) => { console.error('Errore', err); alert('Impossibile disattivare.'); }
      });
    }
  }
}
