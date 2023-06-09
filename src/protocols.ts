import { Hotel } from '@prisma/client';

export type ApplicationError = {
  name: string;
  message: string;
};

export type ViaCEPAddress = {
  logradouro: string;
  complemento: string;
  bairro: string;
  localidade: string;
  uf: string;
};

export type AddressEnrollment = {
  logradouro: string;
  complemento: string;
  bairro: string;
  cidade: string;
  uf: string;
  error?: string;
};

export type RequestError = {
  status: number;
  data: object | null;
  statusText: string;
  name: string;
  message: string;
};

export type TicketType = {
  id: number;
  name: string;
  price: number;
  isRemote: boolean;
  includesHotel: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type Ticket = {
  id: number;
  status: string; //RESERVED | PAID
  ticketTypeId: number;
  enrollmentId: number;
  TicketType: TicketType;
  createdAt: Date;
  updatedAt: Date;
};

export type Payment = {
  id: number;
  ticketId: number;
  value: number;
  cardIssuer: string; //VISA | MASTERCARD
  cardLastDigits: string;
  createdAt: Date;
  updatedAt: Date;
};

// Define CardData type
export type CardData = {
  issuer: string;
  number: number;
  name: string;
  expirationDate: string;
  cvv: number;
};

// Update PaymentsProcessType
export type PaymentsProcessType = {
  ticketId: number;
  userId?: number;
  cardData: CardData;
};

export type HotelIdParams = Pick<Hotel, 'id'>;
