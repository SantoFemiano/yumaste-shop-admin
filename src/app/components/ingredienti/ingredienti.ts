import {ChangeDetectorRef, Component, OnInit} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService} from '../../services/admin';
import { Ingrediente, Fornitore, Allergene} from '../../models/admin-models';
import { NavbarComponent} from '../navbar/navbar';
import { finalize } from 'rxjs/operators';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-ingredienti',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarComponent],
  templateUrl: './ingredienti.html'
})
export class IngredientiComponent implements OnInit {
  ingredienti: Ingrediente[] = [];
  fornitori: Fornitore[] = [];
  allergeniList: Allergene[] = [];
  tuttiValoriNutrizionali: any[] = [];
  tuttiIngredientiAllergeni: any[] = [];

  // Variabili per la modale dei dettagli
  ingredienteSelezionato: Ingrediente | null = null;
  valoriSelezionati: any = null;
  allergeniSelezionati: any[] = [];

  // Variabile per l'ingrediente in modifica
  ingredienteInModifica: Ingrediente | null = null;

  isLoading: boolean = false;
  isSaving: boolean = false;

  nuovoIngrediente: Ingrediente = this.getOggettoVuoto();

  constructor(private adminService: AdminService,
              private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.caricaDati();
  }

  getOggettoVuoto(): Ingrediente {
    return {
      ean: '', nome: '', descrizione: '', unitaMisura: 'g', prezzoPerUnita: 0, attivo: true,
      nomeFornitore:'', partitaIva:null,
      fornitoreId: null as any,
      valoriNutrizionali: { proteine: 0, carboidrati: 0, zuccheri: 0, fibre: 0, grassi: 0, sale: 0, chilocalorie: 0 },
      allergeniIds: []
    };
  }

  caricaDati() {
    this.isLoading = true;

    forkJoin({
      ingRes: this.adminService.getIngredienti(),
      fornRes: this.adminService.getFornitori(),
      allergRes: this.adminService.getAllergeni(),
      valoriRes: this.adminService.getTuttiValoriNutrizionali(),
      allergeniCollRes: this.adminService.getTuttiIngredientiAllergeni()
    }).pipe(
      finalize(() => {
        this.isLoading = false;
        this.cdr.detectChanges();
      })
    ).subscribe({
      next: (risultati: any) => {
        this.ingredienti = risultati.ingRes.content ? risultati.ingRes.content : risultati.ingRes;
        this.fornitori = risultati.fornRes.content ? risultati.fornRes.content : risultati.fornRes;
        this.allergeniList = risultati.allergRes;

        // Salviamo le liste globali per i dettagli
        this.tuttiValoriNutrizionali = risultati.valoriRes;
        this.tuttiIngredientiAllergeni = risultati.allergeniCollRes;
      },
      error: (err) => { console.error('Errore caricamento dati:', err); }
    });
  }

  toggleAllergene(id: number) {
    const index = this.nuovoIngrediente.allergeniIds.indexOf(id);
    if (index > -1) {
      this.nuovoIngrediente.allergeniIds.splice(index, 1);
    } else {
      this.nuovoIngrediente.allergeniIds.push(id);
    }
  }

  apriDettagli(ing: Ingrediente) {
    this.ingredienteSelezionato = ing;
    this.valoriSelezionati = this.tuttiValoriNutrizionali.find(v => v.nome_Ingrediente === ing.nome);

    let idsAllergeni: number[] = [];

    if (ing.allergeniIds && ing.allergeniIds.length > 0) {
      idsAllergeni = ing.allergeniIds;
    }
    else {
      idsAllergeni = this.tuttiIngredientiAllergeni
        .filter(a => a.ingredienteId === ing.id)
        .map(c => c.allergeneId);
    }


    this.allergeniSelezionati = this.allergeniList.filter(al => idsAllergeni.includes(al.id));
  }
  isAllergeneSelected(id: number): boolean {
    return this.nuovoIngrediente.allergeniIds.includes(id);
  }

  salvaIngrediente() {
    if (!this.nuovoIngrediente.partitaIva) {
      alert("Devi selezionare un fornitore nella prima scheda!");
      return;
    }

    this.isSaving = true;
    this.adminService.addIngrediente(this.nuovoIngrediente).pipe(
      finalize(() => {
        this.isSaving = false;
        this.cdr.detectChanges();
      })
    ).subscribe({
      next: () => {
        alert('Ingrediente salvato con Valori Nutrizionali e Allergeni!');
        this.caricaDati();
        this.nuovoIngrediente = this.getOggettoVuoto();
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Errore durante il salvataggio:', err);
        alert('Errore! Verifica i campi inseriti. (Controlla la console)');
      }
    });
  }

  // --- METODI PER MODIFICA E CANCELLAZIONE ---

  apriModaleModifica(ing: Ingrediente) {
    this.ingredienteInModifica = { ...ing };
  }

  salvaModificaIngrediente() {
    if (this.ingredienteInModifica && this.ingredienteInModifica.id) {
      this.isSaving = true;
      this.adminService.updateIngrediente(this.ingredienteInModifica.id, this.ingredienteInModifica).pipe(
        finalize(() => {
          this.isSaving = false;
          this.cdr.detectChanges();
        })
      ).subscribe({
        next: () => {
          alert('Ingrediente aggiornato con successo!');
          this.ingredienteInModifica = null; // Chiude la visualizzazione nel modale
          this.caricaDati();
        },
        error: (err) => {
          console.error('Errore aggiornamento ingrediente:', err);
          alert('Impossibile aggiornare l\'ingrediente.');
        }
      });
    }
  }

  onDeleteIngrediente(id: number | undefined) {
    if (!id) return;
    if (confirm('Sei sicuro di voler disattivare questo ingrediente?')) {
      this.adminService.deleteIngrediente(id).subscribe({
        next: () => {
          alert('Ingrediente rimosso/disattivato con successo!');
          this.caricaDati();
        },
        error: (err) => {
          console.error('Errore durante la rimozione', err);
          alert('Impossibile rimuovere l\'ingrediente.');
        }
      });
    }
  }
}
