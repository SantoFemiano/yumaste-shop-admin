import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminService } from '../../services/admin';
import { NavbarComponent } from '../navbar/navbar';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-clienti',
  standalone: true,
  imports: [CommonModule, NavbarComponent],
  templateUrl: './clienti.html'
})
export class ClientiComponent implements OnInit {
  clienti: any[] = [];
  isLoading: boolean = false;

  constructor(
    private adminService: AdminService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.caricaClienti();
  }

  caricaClienti() {
    this.isLoading = true;
    this.adminService.getClienti().pipe(
      finalize(() => {
        this.isLoading = false;
        this.cdr.detectChanges();
      })
    ).subscribe({
      next: (data) => {
        this.clienti = data;
      },
      error: (err) => {
        console.error('Errore nel caricamento dei clienti', err);
      }
    });
  }

  onDeleteCliente(id: number | undefined) {
    if (!id) return;

    if (confirm('Sei sicuro di voler eliminare questo cliente? L\'operazione è irreversibile.')) {
      this.isLoading = true; // Mettiamo in caricamento la tabella
      this.adminService.deleteCliente(id).pipe(
        finalize(() => {
          this.isLoading = false;
          this.cdr.detectChanges();
        })
      ).subscribe({
        next: () => {
          alert('Cliente eliminato con successo!');
          this.caricaClienti(); // Ricarica la tabella
        },
        error: (err) => {
          console.error('Errore durante l\'eliminazione', err);
          alert('Impossibile eliminare il cliente. Potrebbe avere ordini associati nel database.');
        }
      });
    }
  }
}
