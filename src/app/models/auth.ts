// Rappresenta i dati che inviamo al AuthController (/api/auth/login)
export interface LoginRequest {
  email: string;
  password: string;
}

// Rappresenta la risposta che riceviamo dal backend (al AuthResponse.java)
export interface AuthResponse {
  token: string;
}

export interface RegisterRequest {
  cf: string;
  nome: string;
  cognome: string;
  dataNascita: string; // Formato YYYY-MM-DD
  telefono: string;
  email: string;
  password: string;
}
