import { HttpInterceptorFn } from '@angular/common/http';
// Importa SOLO la costante, NON il servizio!
import { TOKEN_KEY } from '../services/auth';

export const authInterceptor: HttpInterceptorFn = (req, next) => {

  // Leggiamo il token direttamente dalla memoria del browser
  const token = localStorage.getItem(TOKEN_KEY);

  if (token) {
    const clonedRequest = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
    return next(clonedRequest);
  }

  return next(req);
};
