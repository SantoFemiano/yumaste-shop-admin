import { Component, OnInit, ChangeDetectorRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminService } from '../../services/admin';
import { NavbarComponent } from '../navbar/navbar';
import { finalize } from 'rxjs/operators';
// Importiamo Chart.js e tutti i suoi componenti necessari
import { Chart, registerables } from 'chart.js';

// Registriamo i moduli di Chart.js (necessario nelle versioni recenti)
Chart.register(...registerables);

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, NavbarComponent],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class DashboardComponent implements OnInit {

  stats: any = null;
  isLoading: boolean = true;
  chart: any = null; // Variabile per memorizzare l'istanza del grafico

  constructor(
    private adminService: AdminService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.caricaStatistiche();
  }

  caricaStatistiche() {
    this.isLoading = true;

    // Se c'è già un grafico disegnato (es. sto ricaricando la pagina tramite il tasto), lo distruggo
    if (this.chart) {
      this.chart.destroy();
    }

    this.adminService.getDashboardStats().pipe(
      finalize(() => {
        this.isLoading = false;
        this.cdr.detectChanges();
        // Disegniamo il grafico SOLO DOPO che l'HTML ha terminato il caricamento
        this.disegnaGrafico();
      })
    ).subscribe({
      next: (res) => {
        this.stats = res;
      },
      error: (err) => {
        console.error('Errore caricamento statistiche', err);
      }
    });
  }

  disegnaGrafico() {
    // Cerchiamo l'elemento canvas nel DOM
    const canvas = document.getElementById('venditeChart') as HTMLCanvasElement;
    if (!canvas) return; // Sicurezza: se non lo trova, esce

    // Siccome il backend attualmente non ci restituisce uno storico mensile,
    // simuliamo un andamento fittizio per dare l'idea del layout.
    // L'ultimo mese avrà i dati REALI presi dalla tua chiamata (stats.totaleOrdini)
    const datiSimulatiOrdini = [12, 19, 15, 25, 22, this.stats?.totaleOrdini || 0];

    this.chart = new Chart(canvas, {
      type: 'bar', // Puoi cambiare in 'line' se preferisci il grafico a linee
      data: {
        labels: ['Ottobre', 'Novembre', 'Dicembre', 'Gennaio', 'Febbraio', 'Questo Mese (Reale)'],
        datasets: [{
          label: 'Ordini Completati',
          data: datiSimulatiOrdini,
          backgroundColor: 'rgba(13, 110, 253, 0.2)', // Blu primario di bootstrap semi-trasparente
          borderColor: 'rgba(13, 110, 253, 1)',      // Bordo blu pieno
          borderWidth: 2,
          borderRadius: 6, // Arrotonda le punte delle barre
          hoverBackgroundColor: 'rgba(13, 110, 253, 0.4)'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false, // Permette al grafico di adattarsi all'altezza del div
        plugins: {
          legend: {
            display: false // Nascondiamo la legenda in alto per un look più pulito
          },
          tooltip: {
            backgroundColor: '#343a40',
            padding: 12,
            cornerRadius: 8
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            grid: {
              color: '#f8f9fa', // Grigio chiarissimo per le linee di sfondo
            },
            border: { display: false }
          },
          x: {
            grid: {
              display: false // Niente linee verticali, molto più moderno
            },
            border: { display: false }
          }
        }
      }
    });
  }
}
